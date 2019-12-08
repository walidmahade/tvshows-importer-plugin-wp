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

	register_rest_route( 'tvshows/', '/add-image/', array (
		'methods' => 'POST',
		'callback' => 'set_image_from_url'
	));
}

//
//function set_poster_url($data) {
//	$offset = $data->get_param('offset')
//}

// If the function it's not available, require it.
if ( ! function_exists( 'download_url' ) ) {
    require_once ABSPATH . 'wp-admin/includes/file.php';
}
if ( ! function_exists( 'media_handle_sideload' ) ) {
    require_once ABSPATH . 'wp-admin/includes/media.php';
}
if ( ! function_exists( 'wp_read_image_metadata' ) ) {
    require_once ABSPATH . 'wp-admin/includes/image.php';
}

function set_image_from_url($data) {

	$url = $data->get_param('imgurl');
	
    $tmp = download_url( $url );

    $file_array = array(
        'name' => basename( $url ),
        'tmp_name' => $tmp
	);

    /**
     * Check for download errors
     * if there are error unlink the temp file name
     */
    if ( is_wp_error( $tmp ) ) {
        @unlink( $file_array[ 'tmp_name' ] );
        return $tmp;
    }

    /**
     * now we can actually use media_handle_sideload
     * we pass it the file array of the file to handle
     * and the post id of the post to attach it to
     * $post_id can be set to '0' to not attach it to any particular post
     */
	$post_id = '0';

    $id = media_handle_sideload( $file_array, $post_id );
	// return "test";
    /**
     * We don't want to pass something to $id
     * if there were upload errors.
     * So this checks for errors
     */
    if ( is_wp_error( $id ) ) {
        @unlink( $file_array['tmp_name'] );
        return $id;
    }

    /**
     * Now we can get the url of the sideloaded file
     * $value now contains the file url in WordPress
     * $id is the attachment id
     */
    $value = wp_get_attachment_url( $id );

// Now you can do something with $value (or $id)

    return $id;
    // return "works";

}



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
		return $posts[0]->ID;
	} else {
		return false;
	}
}

// =============== rest api save taxonomy ================ //
function action_rest_insert_tvshows( $post, $request, $true ) {
    $params = $request->get_json_params();
    if(array_key_exists("terms", $params)) {
        foreach($params["terms"] as $taxonomy => $terms) {
            wp_set_object_terms($post->ID, $terms, $taxonomy);
        }
    }
}

add_action("rest_insert_tvshows", "action_rest_insert_tvshows", 10, 3);