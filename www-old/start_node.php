<?php

shell_exec('node app >/dev/null 2>/dev/null &');

$url = "http://".$_SERVER["SERVER_NAME"]."/";

header("Location: $url");

?>
