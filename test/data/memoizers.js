function x() {
	if (!this._x) {
		this._x = y();
	}
	return this._x;
}