/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @package FacebookCommerce
 */

jQuery( document ).ready( function( $ ) {

	/**
	 * Gets any new excluded categories being added.
	 *
	 * @return {string[]}
	 */
	function getExcludedCategoriesAdded() {

		const newCategoryIDs = $( '#wc_facebook_excluded_product_category_ids' ).val();
		let oldCategoryIDs   = [];

		if ( window.facebook_for_woocommerce_settings_sync && window.facebook_for_woocommerce_settings_sync.excluded_category_ids ) {
			oldCategoryIDs = window.facebook_for_woocommerce_settings_sync.excluded_category_ids;
		}

		// return IDs that are in the new value that were not in the saved value
		return $( newCategoryIDs ).not( oldCategoryIDs ).get();
	}


	/**
	 * Gets any new excluded tags being added.
	 *
	 * @return {string[]}
	 */
	function getExcludedTagsAdded() {

		const newTagIDs = $( '#wc_facebook_excluded_product_tag_ids' ).val();
		let oldTagIDs   = [];

		if ( window.facebook_for_woocommerce_settings_sync && window.facebook_for_woocommerce_settings_sync.excluded_tag_ids ) {
			oldTagIDs = window.facebook_for_woocommerce_settings_sync.excluded_tag_ids;
		}

		// return IDs that are in the new value that were not in the saved value
		return $( newTagIDs ).not( oldTagIDs ).get();
	}


	/**
	 * Toggles availability of input in setting groups.
	 *
	 * @param {boolean} enable whether fields in this group should be enabled or not
	 */
	function toggleSettingOptions( enable ) {

		$( '.product-sync-field' ).each( function() {

			let $element = $( this );

			if ( $( this ).hasClass( 'wc-enhanced-select' ) ) {
				$element = $( this ).next( 'span.select2-container' );
			}

			if ( enable ) {
				$element.css( 'pointer-events', 'all' ).css( 'opacity', '1.0' );
			} else {
				$element.css( 'pointer-events', 'none' ).css( 'opacity', '0.4' );
			}
		} );
	}

	if ( $( 'form.wc-facebook-settings' ).hasClass( 'disconnected' ) ) {
		toggleSettingOptions( false );
	}

	// toggle availability of options withing field groups
	$( 'input#wc_facebook_enable_product_sync' ).on( 'change', function ( e ) {

		if ( $( 'form.wc-facebook-settings' ).hasClass( 'disconnected' ) ) {
			$( this ).css( 'pointer-events', 'none' ).css( 'opacity', '0.4' );
			return;
		}

		toggleSettingOptions( $( this ).is( ':checked' ) );

	} ).trigger( 'change' );


	let submitSettingsSave = false;

	$( 'input[name="save_product_sync_settings"]' ).on( 'click', function ( e ) {

		if ( ! submitSettingsSave ) {
			e.preventDefault();
		} else {
			return true;
		}

		const $submitButton   = $( this ),
		      categoriesAdded = getExcludedCategoriesAdded(),
		      tagsAdded       = getExcludedTagsAdded();

		if ( categoriesAdded.length > 0 || tagsAdded.length > 0 ) {

			$.post( facebook_for_woocommerce_settings_sync.ajax_url, {
				action:     'facebook_for_woocommerce_set_excluded_terms_prompt',
				security:   facebook_for_woocommerce_settings_sync.set_excluded_terms_prompt_nonce,
				categories: categoriesAdded,
				tags:       tagsAdded,
			}, function ( response ) {

				if ( response && ! response.success ) {

					// close existing modals
					$( '#wc-backbone-modal-dialog .modal-close' ).trigger( 'click' );

					// open new modal, populate template with AJAX response data
					new $.WCBackboneModal.View( {
						target: 'facebook-for-woocommerce-modal',
						string: response.data,
					} );

					// exclude products: submit form as normal
					$( '.facebook-for-woocommerce-confirm-settings-change' ).on( 'click', function () {

						blockModal();

						submitSettingsSave = true;
						$submitButton.trigger( 'click' );

					} );

				} else {

					// no modal displayed: submit form as normal
					submitSettingsSave = true;
					$submitButton.trigger( 'click' );
				}
			} );

		} else {

			// no terms added: submit form as normal
			submitSettingsSave = true;
			$submitButton.trigger( 'click' );
		}
	} );

} );
