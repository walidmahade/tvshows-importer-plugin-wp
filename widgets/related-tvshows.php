<?php
// The widget class
class Mw_TV_show_related extends WP_Widget {
	// Main constructor
	public function __construct() {
		parent::__construct(
			'mw_tv_show_related',
			__( 'TV show Related', 'text_domain' ),
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
		$post_id = get_the_ID();
		$cat_ids = array();
		$categories = get_the_category( $post_id );

		if(!empty($categories) && is_wp_error($categories)):
			foreach ($categories as $category):
				array_push($cat_ids, $category->term_id);
			endforeach;
		endif;

		$current_post_type = get_post_type($post_id);
		$query_args = array(

			'category__in'   => $cat_ids,
			'post_type'      => $current_post_type,
			'post_not_in'    => array($post_id),
			'posts_per_page'  => '5'


		);

		$related_cats_post = new WP_Query( $query_args );

		if($related_cats_post->have_posts()):
			echo '<div id="related-posts-wrap">';

		    while($related_cats_post->have_posts()): $related_cats_post->the_post(); ?>
                <div class="related-post">
                    <a href="<?php the_permalink(); ?>">
                        <img src="<?php the_post_thumbnail_url(); ?>" alt="Poster: <?php the_title(); ?>">
                        <div class="title"><?php the_title(); ?></div>
                    </a>
                </div>
			<?php endwhile;

			echo '</div>';

			// Restore original Post Data
			wp_reset_postdata();
		endif;
	}
}