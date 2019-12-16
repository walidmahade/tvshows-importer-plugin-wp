<?php
// The widget class
class Mw_TV_show_cast extends WP_Widget {
	// Main constructor
	public function __construct() {
		parent::__construct(
			'mw_tv_show_cast',
			__( 'Mw TV show cast', 'text_domain' ),
			array(
				'customize_selective_refresh' => true,
			)
		);
	}

	// The widget form (for the backend )
	public function form( $instance ) {
		/* ... */
	}

	// Update widget settings
	public function update( $new_instance, $old_instance ) {
		/* ... */
	}

	// Display the widget
	public function widget( $args, $instance ) {
/*
		// check if the repeater field has rows of data
		if( have_rows('series_cast') ):
			// loop through the rows of data
			while ( have_rows('series_cast') ) : the_row();
				$cast .= the_sub_field('name') . ", ";
				// display a sub field value
//				echo "<span>" . the_sub_field('name') . ",</span>";
			endwhile;

			echo rtrim($cast,',');

		else :
			echo "<p class='not-found'>No Videos found.</p>";
		endif;
*/

		$rows = get_field('series_cast');
		$cast = "";

		if ($rows) {
			foreach($rows as $row) {
				$cast .= $row['name'] . ", ";
			}

			echo rtrim($cast,', ');
		} else {
			echo "<p class='not-found'>No cast found.</p>";
		}
	}
}