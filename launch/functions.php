<?php
function stream_map_file($attachment = true) {
  // Shamelessly inspired from drupal source includes/bootstrap.inc
  //
  $last_modified = gmdate("D, d M Y H:i:s", filemtime(MAPFILE)) . ' GMT';
  $etag = '"' . md5($last_modified) . '"';

  $if_modified_since = isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) ? stripslashes($_SERVER['HTTP_IF_MODIFIED_SINCE']) : false;
  $if_none_match = isset($_SERVER['HTTP_IF_NONE_MATCH']) ? stripslashes($_SERVER['HTTP_IF_NONE_MATCH']) : false;

  if ($if_modified_since && $if_none_match
    && $if_none_match == $etag
    && $if_modified_since == $last_modified) {
      header('HTTP/1.1 304 Not Modified');
      header("Etag: $etag");
      exit;
  }

  // If no cache is available, send the file
  //
  header("Last-Modified: $last_modified");
  header("Etag: $etag");

  header("Expires: Sun, 19 Nov 1978 05:00:00 GMT");
  header("Cache-Control: must-revalidate");

  // Shamelessly copied from http://php.net/readfile
  //
  header('Content-Description: Watermap Home Print');
  header('Content-Type: image/jpeg');

  header('Content-Disposition: ' .
    ($attachment ? 'attachment; filename=' . basename(MAPFILE) : 'inline'));

  header('Content-Transfer-Encoding: binary');
  header('Content-Length: ' . filesize(MAPFILE));

  ob_clean();
  flush();

  readfile(MAPFILE);
}
?>
