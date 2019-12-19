<?php
// The widget class
class Mw_TV_show_cast_details extends WP_Widget {
	// Main constructor
	public function __construct() {
		parent::__construct(
			'mw_tv_show_cast_details',
			__( 'TV show cast Details', 'text_domain' ),
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
		echo "<div class='casts-wrap'>";
		if( have_rows('series_cast') ):
			while ( have_rows('series_cast') ) : the_row();
				$image = get_sub_field('profile_image');
				$name = get_sub_field('name');

				echo "<div class='casts-item'>";
					echo "<img src='$image'/>";
					echo "<div class='cast-name'>$name</div>";
//					echo "<div class='cast-character'>" . the_sub_field('character') . "</div>";
				echo "</div>";
			endwhile;
		else :
			echo "<p class='not-found'>No cast found.</p>";
		endif;
		echo "</div>";
	}
}