<?php
function stream_map_file($attachment = true) {
  // Shamelessly copied from http://php.net/readfile
  //
  header('Content-Description: Watermap Home Print');
  header('Content-Type: image/jpeg');

  header('Content-Disposition: ' .
    ($attachment ? 'attachment; filename=' . basename(MAPFILE) : 'inline'));

  header('Content-Transfer-Encoding: binary');
  header('Expires: 0');
  header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
  header('Pragma: public');
  header('Content-Length: ' . filesize(MAPFILE));

  ob_clean();
  flush();

  readfile(MAPFILE);
}
?>
