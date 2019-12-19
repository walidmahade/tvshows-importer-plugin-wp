<?php
// The widget class
class Mw_TV_show_seasons extends WP_Widget {
	// Main constructor
	public function __construct() {
		parent::__construct(
			'mw_tv_show_seasons',
			__( 'TV show seasons', 'text_domain' ),
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
		if( have_rows('seasons_list') ):
			echo "<div id='seasons-tab'>";
			$tab_nav = "";
			$tab_content = "";
			$i = 0;

			while ( have_rows('seasons_list') ) : the_row();
				$name = get_sub_field('name');
				$date = get_sub_field('date');
				$episode_count = get_sub_field('episode_count');
				$episode_list = get_sub_field('episode_list');

				$tab_nav .= ("
					<div class='tab-nav-item' data-tab-id='$i'>
						<div class='name'>$name</div>
						<div class='date'>$date</div>
						<div class='e-count'>Episodes Count: $episode_count</div>
					</div>
				");

				$tab_content .=("
					<div class='tab-content-item' data-tab-id='$i'>
						$episode_list
					</div>
				");

				// increase counter
				$i++;

			endwhile;

			echo "<div class='tab-nav'>";
				echo $tab_nav;
			echo "</div>";

			echo "<div class='tab-content'>";
				echo $tab_content;
			echo "</div>";

		else :
			echo "<p class='not-found'>No Seasons found.</p>";
		endif;

		echo "</div>";
	}
}