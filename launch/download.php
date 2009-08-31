<?php
// Shamelessly copied from http://php.net/readfile

$file = 'private/WATERMAP.jpg';

header('Content-Description: Watermap Home Print');
header('Content-Type: image/jpeg');
header('Content-Disposition: attachment; filename=' . basename($file));
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: ' . filesize($file));

ob_clean();
flush();

readfile($file);

exit;
?>
