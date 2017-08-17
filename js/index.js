
$(document).ready(function() {
    var example = "238新北市樹林區中山路二段34號,1\n238新北市樹林區中山路二段128號,2";
    $("#data").attr("placeholder", example);

    initMap();
});

function initMap() {
    var center = new google.maps.LatLng(24.983952, 121.414933);
    var mapProp = {
        center: center,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"), mapProp);

    var marker = createMarker(center, "./img/star.png", "google.maps.Animation.BOUNCE");
    marker.setMap(map);
}

function process() {
    $("map").empty();

    var lines = $("#data").val().split("\n");

    var data = [];
    lines.forEach(function (element) {
        var address_text = element.split(",");
        data.push({location: address2latlng(address_text[0]), note: address_text[1]});
    });

    // init map
    var center = new google.maps.LatLng(24.983952, 121.414933);
    var mapProp = {
        center: center,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"), mapProp);

    var marker = createMarker(center, "./img/star.png", "google.maps.Animation.BOUNCE");
    marker.setMap(map);

    data.forEach(function(element){
        if (element.location === null) return;

        var latlng = new google.maps.LatLng(element.location.lat, element.location.lng);
        var marker = createMarker(latlng, null, null);
        marker.setMap(map);
    });
}

function address2latlng(address) {
    var result = null;

    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyAj4PdVqJ5dptTNojTHop1tUsird2yxZgg",
        method: "GET",
        async: false,
        success: function (res) {
            if (res.results[0].geometry.location) {
                result = {lat: res.results[0].geometry.location.lat, lng: res.results[0].geometry.location.lng};
            } else {
                console.log(address + "解析錯誤 : " + res);
            }
        },
        error: function (xhr, status, error) {
            console.log(JSON.stringify(xhr) + ",\n" + status + ",\n" + error);
        }
    });

    return result;
}

function createMarker(position, iconPath, animationType) {
    var marker = new google.maps.Marker({
        position: position,
    });

    if (iconPath !== null) {
        marker.setIcon(iconPath);
    }
    if (animationType !== null) {
        marker.setAnimation(eval(animationType));
    }

    return marker;
}