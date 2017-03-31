interface String {
	format(...arg:any[]): string;
}
String.prototype.format = function() {
	const args = arguments;
	return this.replace(
		/{(\d)}/g,
		function(match: string, num: number) {
			return typeof args[num] !== "undefined" ? args[num] : match;
		}
	);
};
