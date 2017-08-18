$(document).ready(function () {
    var example = "黃OO,238新北市樹林區中山路二段34號,1\n陳XX,238新北市樹林區中山路二段128號,2\n李YY,238新北市樹林區中山路二段150號,3";
    $("#data").attr("placeholder", example);

    initMap(0);
});

var markers = [];

function initMap(type) {
    var center = new google.maps.LatLng(24.979952, 121.402000);
    var mapProp = {
        center: center,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map"), mapProp);

    var office = new google.maps.LatLng(24.983952, 121.414933);
    var marker = (type === 0) ? createMarker(office, "./img/star.png", null) : createMarker(office, "./img/star.png", "google.maps.Animation.BOUNCE");
    marker.setMap(map);

    var infowindow = new google.maps.InfoWindow({content: "<b>衛生所</b>"});
    if (type === 0) infowindow.open(map, marker);

    return map;
}

function process() {
    markers = [];
    $("#map").empty();
    $("#check").empty();

    var lines = $("#data").val().split("\n");

    var data = [];
    lines.forEach(function (element) {
        var name_address_level = element.split(",");
        data.push({name: name_address_level[0], location: address2latlng(name_address_level[1]), level: name_address_level[2]});
    });

    var map = initMap(1);

    var html = "";
    for (var i = 0; i < data.length; i++) {
        if (data[i].location === null) return;

        var latlng = new google.maps.LatLng(data[i].location.lat, data[i].location.lng);
        var marker = createMarker(latlng, data[i].level, null);
        markers.push(marker);
        marker.setMap(map);

        var infowindow = new google.maps.InfoWindow({content: data[i].name});
        infowindow.open(map, marker);

        html += "<span><input id=\"idx" + i + "\" type=\"checkbox\" onclick=\"showAndHideMarker(" + i + ")\" checked>" + data[i].name + "</span>";
    }

    $("#check").append(html);
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
        position: position
    });

    if (iconPath !== null) {
        switch (iconPath) {
            case "1":
                marker.setIcon("./img/1.png");
                break;
            case "2":
                marker.setIcon("./img/2.png");
                break;
            case "3":
                marker.setIcon("./img/3.png");
                break;
            default:
                marker.setIcon(iconPath);
                break;
        }
    }
    if (animationType !== null) {
        marker.setAnimation(eval(animationType));
    }

    return marker;
}

function showAndHideMarker(index) {
    var isChecked = document.getElementById("idx" + index).checked;

    markers[index].setVisible(isChecked);
}