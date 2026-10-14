export default {
  callback_1: function (data, layer) {
	const popup = '<h1>' + data.properties.GEBIETSNAM + '</h1>';
	
	layer.bindPopup(popup);
}
};