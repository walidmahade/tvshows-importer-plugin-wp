<?php
// The widget class
class Mw_TV_show_cast extends WP_Widget {
	// Main constructor
	public function __construct() {
		parent::__construct(
			'mw_tv_show_cast',
			__( 'TV show cast Names', 'text_domain' ),
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