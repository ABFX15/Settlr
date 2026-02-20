<?php
/**
 * Plugin Name: Settlr — USDC Payments for WooCommerce
 * Plugin URI:  https://settlr.dev/integrations/woocommerce
 * Description: Accept USDC stablecoin payments at checkout. Instant settlement, no chargebacks, from 1% per transaction.
 * Version:     1.0.0
 * Author:      Settlr
 * Author URI:  https://settlr.dev
 * License:     GPL-2.0+
 * Text Domain: settlr-woocommerce
 * Requires Plugins: woocommerce
 *
 * WC requires at least: 6.0
 * WC tested up to:      9.0
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'SETTLR_WC_VERSION', '1.0.0' );
define( 'SETTLR_WC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'SETTLR_WC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Check that WooCommerce is active before initialising.
 */
function settlr_wc_check_woocommerce() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function () {
            echo '<div class="error"><p><strong>Settlr USDC Payments</strong> requires WooCommerce to be installed and active.</p></div>';
        } );
        return false;
    }
    return true;
}

/**
 * Register the payment gateway with WooCommerce.
 */
add_filter( 'woocommerce_payment_gateways', function ( $gateways ) {
    if ( settlr_wc_check_woocommerce() ) {
        require_once SETTLR_WC_PLUGIN_DIR . 'includes/class-settlr-gateway.php';
        $gateways[] = 'WC_Gateway_Settlr';
    }
    return $gateways;
} );

/**
 * Add "Settings" link on the plugins page.
 */
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), function ( $links ) {
    $settings_link = '<a href="' . admin_url( 'admin.php?page=wc-settings&tab=checkout&section=settlr' ) . '">Settings</a>';
    array_unshift( $links, $settings_link );
    return $links;
} );

/**
 * Declare HPOS (High-Performance Order Storage) compatibility.
 */
add_action( 'before_woocommerce_init', function () {
    if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );
    }
} );
