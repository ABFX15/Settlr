<?php
/**
 * Settlr USDC Payment Gateway for WooCommerce
 *
 * Registers "Pay with USDC" as a WooCommerce payment method.
 * On checkout, creates a payment via the Settlr API and redirects to
 * the hosted checkout page. A webhook callback updates the order status
 * when the on-chain payment is confirmed.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WC_Gateway_Settlr extends WC_Payment_Gateway {

    /** @var string Settlr API key */
    private $api_key;

    /** @var string Settlr API base URL */
    private $api_base_url;

    /** @var string Merchant wallet address */
    private $wallet_address;

    /** @var string Webhook secret for verifying callbacks */
    private $webhook_secret;

    public function __construct() {
        $this->id                 = 'settlr';
        $this->icon               = SETTLR_WC_PLUGIN_URL . 'assets/usdc-logo.svg';
        $this->has_fields         = false;
        $this->method_title       = 'Settlr USDC';
        $this->method_description = 'Accept USDC stablecoin payments. Instant settlement, no chargebacks.';
        $this->supports           = array( 'products', 'refunds' );

        // Load settings form fields
        $this->init_form_fields();
        $this->init_settings();

        // Read settings
        $this->title          = $this->get_option( 'title', 'Pay with USDC' );
        $this->description    = $this->get_option( 'description', 'Pay with USDC stablecoin. No wallet needed — gasless checkout.' );
        $this->enabled        = $this->get_option( 'enabled', 'yes' );
        $this->api_key        = $this->get_option( 'api_key' );
        $this->api_base_url   = rtrim( $this->get_option( 'api_base_url', 'https://settlr.dev' ), '/' );
        $this->wallet_address = $this->get_option( 'wallet_address' );
        $this->webhook_secret = $this->get_option( 'webhook_secret' );

        // Save admin options
        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );

        // Register webhook listener
        add_action( 'woocommerce_api_settlr_webhook', array( $this, 'handle_webhook' ) );
    }

    /**
     * Admin settings form.
     */
    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title'   => 'Enable/Disable',
                'type'    => 'checkbox',
                'label'   => 'Enable Settlr USDC Payments',
                'default' => 'yes',
            ),
            'title' => array(
                'title'       => 'Title',
                'type'        => 'text',
                'description' => 'Payment method name shown at checkout.',
                'default'     => 'Pay with USDC',
            ),
            'description' => array(
                'title'       => 'Description',
                'type'        => 'textarea',
                'description' => 'Shown below the payment method at checkout.',
                'default'     => 'Pay with USDC stablecoin. No wallet needed — gasless checkout.',
            ),
            'api_key' => array(
                'title'       => 'API Key',
                'type'        => 'password',
                'description' => 'Your Settlr API key from <a href="https://settlr.dev/dashboard/api-keys" target="_blank">settlr.dev/dashboard</a>.',
            ),
            'wallet_address' => array(
                'title'       => 'Wallet Address',
                'type'        => 'text',
                'description' => 'Your USDC receiving wallet address (Solana).',
            ),
            'webhook_secret' => array(
                'title'       => 'Webhook Secret',
                'type'        => 'password',
                'description' => 'Used to verify incoming webhook signatures. Found in your Settlr dashboard.',
            ),
            'api_base_url' => array(
                'title'       => 'API Base URL',
                'type'        => 'text',
                'default'     => 'https://settlr.dev',
                'description' => 'Leave default unless self-hosting.',
            ),
        );
    }

    /**
     * Process the payment — create a Settlr payment and redirect to checkout.
     */
    public function process_payment( $order_id ) {
        $order = wc_get_order( $order_id );

        if ( ! $order ) {
            wc_add_notice( 'Order not found.', 'error' );
            return array( 'result' => 'failure' );
        }

        $payload = array(
            'amount'      => floatval( $order->get_total() ),
            'currency'    => 'USDC',
            'memo'        => sprintf( 'Order #%s from %s', $order->get_order_number(), get_bloginfo( 'name' ) ),
            'redirectUrl' => $this->get_return_url( $order ),
            'webhookUrl'  => home_url( '/wc-api/settlr_webhook' ),
            'metadata'    => array(
                'source'          => 'woocommerce',
                'order_id'        => (string) $order_id,
                'order_number'    => $order->get_order_number(),
                'customer_email'  => $order->get_billing_email(),
            ),
        );

        $response = $this->api_request( 'POST', '/api/payments', $payload );

        if ( is_wp_error( $response ) ) {
            wc_add_notice( 'Payment error: ' . $response->get_error_message(), 'error' );
            return array( 'result' => 'failure' );
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( empty( $body['checkoutUrl'] ) && empty( $body['id'] ) ) {
            wc_add_notice( 'Unable to create payment. Please try again.', 'error' );
            return array( 'result' => 'failure' );
        }

        // Store Settlr payment ID on the order
        $order->update_meta_data( '_settlr_payment_id', $body['id'] );
        $order->update_meta_data( '_settlr_checkout_url', $body['checkoutUrl'] ?? '' );
        $order->save();

        // Mark as pending
        $order->update_status( 'pending', 'Awaiting USDC payment via Settlr.' );

        // Reduce stock
        wc_reduce_stock_levels( $order_id );

        // Empty cart
        WC()->cart->empty_cart();

        // Redirect to Settlr hosted checkout
        $checkout_url = $body['checkoutUrl'] ?? ( $this->api_base_url . '/checkout/' . $body['id'] );

        return array(
            'result'   => 'success',
            'redirect' => $checkout_url,
        );
    }

    /**
     * Handle the webhook callback from Settlr when payment is confirmed.
     */
    public function handle_webhook() {
        $raw_body = file_get_contents( 'php://input' );
        $data     = json_decode( $raw_body, true );

        // Verify signature if webhook secret is configured
        if ( $this->webhook_secret ) {
            $signature = $_SERVER['HTTP_X_SETTLR_SIGNATURE'] ?? '';
            $expected  = hash_hmac( 'sha256', $raw_body, $this->webhook_secret );

            if ( ! hash_equals( $expected, $signature ) ) {
                status_header( 401 );
                echo json_encode( array( 'error' => 'Invalid signature' ) );
                exit;
            }
        }

        $event_type = $data['event'] ?? '';
        $payment_id = $data['data']['id'] ?? '';
        $order_id   = $data['data']['metadata']['order_id'] ?? '';

        if ( ! $order_id ) {
            // Try to find by meta
            $orders = wc_get_orders( array(
                'meta_key'   => '_settlr_payment_id',
                'meta_value' => $payment_id,
                'limit'      => 1,
            ) );
            $order = $orders[0] ?? null;
        } else {
            $order = wc_get_order( $order_id );
        }

        if ( ! $order ) {
            status_header( 404 );
            echo json_encode( array( 'error' => 'Order not found' ) );
            exit;
        }

        switch ( $event_type ) {
            case 'payment.confirmed':
                $tx_sig = $data['data']['txSignature'] ?? '';
                $order->payment_complete( $tx_sig );
                $order->add_order_note( sprintf(
                    'Settlr USDC payment confirmed. Tx: %s',
                    $tx_sig ? '<a href="https://solscan.io/tx/' . $tx_sig . '" target="_blank">' . substr( $tx_sig, 0, 16 ) . '...</a>' : 'N/A'
                ) );
                break;

            case 'payment.failed':
                $order->update_status( 'failed', 'Settlr payment failed: ' . ( $data['data']['error'] ?? 'Unknown error' ) );
                break;

            case 'payment.expired':
                $order->update_status( 'cancelled', 'Settlr payment expired.' );
                break;
        }

        status_header( 200 );
        echo json_encode( array( 'ok' => true ) );
        exit;
    }

    /**
     * Process refunds via Settlr API.
     */
    public function process_refund( $order_id, $amount = null, $reason = '' ) {
        $order      = wc_get_order( $order_id );
        $payment_id = $order->get_meta( '_settlr_payment_id' );

        if ( ! $payment_id ) {
            return new \WP_Error( 'settlr_refund', 'No Settlr payment ID found for this order.' );
        }

        $response = $this->api_request( 'POST', '/api/payments/' . $payment_id . '/refund', array(
            'amount' => floatval( $amount ),
            'reason' => $reason,
        ) );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( ! empty( $body['error'] ) ) {
            return new \WP_Error( 'settlr_refund', $body['error'] );
        }

        $order->add_order_note( sprintf(
            'Settlr refund of $%s USDC processed. Refund ID: %s',
            number_format( $amount, 2 ),
            $body['id'] ?? 'N/A'
        ) );

        return true;
    }

    /**
     * Make an authenticated request to the Settlr API.
     */
    private function api_request( $method, $path, $body = null ) {
        $args = array(
            'method'  => $method,
            'timeout' => 30,
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-API-Key'    => $this->api_key,
            ),
        );

        if ( $body ) {
            $args['body'] = json_encode( $body );
        }

        $url = $this->api_base_url . $path;

        return wp_remote_request( $url, $args );
    }
}
