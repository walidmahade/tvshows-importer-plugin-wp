<?php
/*
    "title": data.name,
	"content": data.overview,
	"tv_genres": data.genres.name,
	"poster_url": "https://image.tmdb.org/t/p/w500/" + data.poster_path,
	"seasons_count": data.seasons.length, // now fetching only seasons
	"season_data": data.seasons,
	"status": "publish"
 */
add_action( 'rest_api_init',  'register_custom_fields' );

function register_custom_fields() {
	//	register_rest_field( 'tvshows', 'poster_url',
	//		array( 'show_in_rest'    => true, )
	//	);
	//	register_rest_field( 'tvshows', 'seasons_count',
	//		array( 'show_in_rest'    => true, )
	//	);
	//	register_rest_field( 'tvshows', 'seasons_list',
	//		array( 'show_in_rest'    => true, )
	//	);
	//	register_rest_field( 'tvshows', 'id',
	//		array( 'show_in_rest'    => true, )
	//	);
	register_rest_route( 'tvshows/', '/all/', array (
		'methods' => 'GET',
		'callback' => 'search_tvshow_id'
	));
}

//
//function set_poster_url($data) {
//	$offset = $data->get_param('offset')
//}

function search_tvshow_id($data) {
//	return "route works";
	$id = $data->get_param('id');

	$posts = get_posts(array(
		'numberposts'	=> 1,
		'post_type'		=> 'tvshows',
		'meta_key'		=> 'id',
		'meta_value'	=> $id
	));

	if (count($posts) == 1) {
		return true;
	} else {
		return false;
	}
}
