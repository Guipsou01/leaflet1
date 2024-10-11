//document.write('-1-');
//
var img = new Image();
img.src = "https://media.tenor.com/ejmDdRGqKDUAAAAe/terminal-montage-donkey-kong.png";

img.onload = function() {
    var width = img.width;
    var height = img.height;
};
//document.write(img.height);
//document.write(img.width);
//document.write('-2-');
//image 1
var imageUrl = 'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
    imageBounds = [[0, 0], [0.1, 0.1]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
//image 2
var imageUrl2 = 'https://maps.lib.utexas.edu/maps/historical/newark_nj_1922.jpg',
    imageBounds2 = [[0.1, 0.1], [0.2, 0.2]];
L.imageOverlay(imageUrl2, imageBounds2).addTo(map);
//image 3
var imageUrl3 = 'https://static.wikia.nocookie.net/terminalmontage/images/4/4e/Screen_Shot_2022-07-15_at_3.30.11_PM.png',
    imageBounds3 = [[0.05, 0.05], [0.15, 0.15]];
L.imageOverlay(imageUrl3, imageBounds3).addTo(map);
