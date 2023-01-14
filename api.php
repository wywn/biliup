<?php
$type = @$_GET["type"];
$m = @$_GET['m'];
$idGet = @$_GET['id'];
$optGet = @$_GET['opt'];

function s2f($s){
    switch ($s){
        case "fo":
            return "follower";
        case "g3":
            return "guard3";
        case "g2":
            return "guard2";
        case "g1":
            return "guard1";
        case "ga":
            return "guardall";
        case "fc":
            return "fanclub";
    }
}

if ($m == "getups"){
    class MyDB extends SQLite3{
        function __construct(){
            $this->open('UPInfo.db');
        }
    }
    $db = new MyDB();
    if(!$db){
        echo $db->lastErrorMsg();
    }
    $sql = "select * from UPInfo order by ID desc;";
    $ret = $db->query($sql);

    $r = [];
    while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
        /*$id = $row['ID'];
        $name = $row['name'];
        $ifchecked = "";
        if ($id == "5"){
            $ifchecked = " checked";
        }
        echo "<label><input name='ups' type='checkbox' value='$id'$ifchecked><a id='$id'>$name</a></label><br>";*/
        array_push($r,[$row['ID'],$row['name']]);
    }
    echo(json_encode($r));
}
if ($m == "getinf"){
    function avoidAdd($org,$top){
        if (!in_array($top,explode(",",$org),true)){
            return $org.$top.",";
        }
        else{
            return $org;
        }
    }
    function getStrOptForSql($opts){
        $str_opts = "";
        for ($i = 0;$i < count($opts);$i++){
            if ($opts[$i] == "ga"){
                $str_opts = avoidAdd($str_opts,s2f("g3"));
                $str_opts = avoidAdd($str_opts,s2f("g2"));
                $str_opts = avoidAdd($str_opts,s2f("g1"));
            }
            else{
                $str_opts = avoidAdd($str_opts,s2f($opts[$i]));
            }
        }
        return $str_opts."time";
    }
    
    class MyDB extends SQLite3{
        function __construct(){
            $this->open('Data.db');
        }
    }
    $db = new MyDB();
    if(!$db){
        echo $db->lastErrorMsg();
    }
    if ($type == "dd"){
        $arr_ups = explode(",",$idGet);
        $f = [];
        foreach($arr_ups as $key){
            $opts = explode('-', $optGet);
            $str_opts = getStrOptForSql($opts);
            $sql = "select $str_opts from Data where ID=$key order by time desc;";
            $ret = $db->query($sql);
            $r = [[],[]];
            while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
                for ($i = 0;$i<count($opts);$i++){
                    if ($opts[$i] == ""){
                        break;
                    }
                    if ($opts[$i] == "ga"){
                        $res = $row['guard1']+$row['guard2']+$row['guard3'];
                    }
                    else{
                        $res = $row[s2f($opts[$i])];
                    }
                    $o = [($row['time'])*1000,$res];
                    array_push($r[$i],$o);
                }
            }
            $r2 = [];
            for ($i = 0;$i<count($opts);$i++){
                array_push($r2,array_merge(array("type"=>$opts[$i]),array("data"=>$r[$i])));
            }
            array_push($f,array_merge(array("id"=>$key),array("data"=>$r2)));
        }
        echo json_encode($f);
    }
    else{
        $arr_opt = explode(",",$optGet);
        $opts = [];
        for ($i = 0;$i < count($arr_opt);$i++){
            $s = explode("-",$arr_opt[$i]);
            for ($n = 0;$n < count($s);$n++){
                if (!in_array($s[$n], $opts)){
                    array_push($opts,$s[$n]);
                }
            }
        }
        $str_opts = getStrOptForSql($opts);
        $sql = "select $str_opts from Data where ID=$idGet order by time desc;";
        $ret = $db->query($sql);

        $data = array();
        foreach ($opts as $key){
            $o = array($key=>[]);
            $data = array_merge($data,$o);
        }
        
        while($row = $ret->fetchArray(SQLITE3_ASSOC) ){
            foreach ($opts as $key){
                if ($key == "ga"){
                    $res = $row['guard1']+$row['guard2']+$row['guard3'];
                }
                else{
                    $res = $row[s2f($key)];
                }
                $o = [($row['time'])*1000,$res];
                array_push($data[$key],$o);
            }
        }
        $r = [];
        for ($i = 0;$i < count($opts);$i++){
            array_push($r,array_merge(array("type"=>$opts[$i]),array("data"=>$data[$opts[$i]])));
        }
        echo json_encode([array_merge(array("id"=>$idGet),array("data"=>$r))]);
    }
}
?>
