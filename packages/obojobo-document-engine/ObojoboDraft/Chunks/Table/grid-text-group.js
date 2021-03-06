import Common from 'Common'

let { TextGroup } = Common.textGroup
let { TextGroupItem } = Common.textGroup
let Util = Common.textGroup.TextGroupUtil
let { StyleableText } = Common.text

class GridTextGroup extends TextGroup {
	constructor(numRows, numCols, dataTemplate, initialItems) {
		super(numRows * numCols, dataTemplate, initialItems)

		this.numRows = numRows
		this.numCols = numCols
		this.fill()
	}

	static fromDescriptor(descriptor, maxItems, dataTemplate, restoreDataDescriptorFn) {
		if (restoreDataDescriptorFn == null) {
			restoreDataDescriptorFn = Util.defaultCloneFn
		}
		let items = []
		for (let item of Array.from(descriptor.textGroup)) {
			items.push(
				new TextGroupItem(
					StyleableText.createFromObject(item.text),
					restoreDataDescriptorFn(item.data)
				)
			)
		}

		return new GridTextGroup(descriptor.numRows, descriptor.numCols, dataTemplate, items)
	}

	static create(numRows, numCols, dataTemplate) {
		if (dataTemplate == null) {
			dataTemplate = {}
		}
		let group = new GridTextGroup(numRows, numCols, dataTemplate)
		group.init(group.maxItems)

		return group
	}

	addRow(rowIndex, text, data) {
		if (rowIndex == null) {
			rowIndex = this.numRows
		}
		if (text == null) {
			text = null
		}
		if (data == null) {
			data = null
		}
		// 0 | 1 | 2
		// 3 | 4 | 5
		// 6 | 7 | 8

		this.maxItems += this.numCols

		let firstInRowIndex = rowIndex * this.numCols
		for (
			let i = firstInRowIndex,
				end = firstInRowIndex + this.numCols - 1,
				asc = firstInRowIndex <= end;
			asc ? i <= end : i >= end;
			asc ? i++ : i--
		) {
			this.addAt(i, text, data)
		}

		this.numRows++

		return this
	}

	addCol(colIndex, text, data) {
		if (colIndex == null) {
			colIndex = this.numCols
		}
		if (text == null) {
			text = null
		}
		if (data == null) {
			data = null
		}
		this.maxItems += this.numRows

		for (let i = this.numRows - 1; i >= 0; i--) {
			this.addAt(i * this.numCols + colIndex, text, data)
		}

		this.numCols++

		return this
	}

	removeRow(rowIndex) {
		if (rowIndex == null) {
			rowIndex = this.numRows - 1
		}
		this.maxItems -= this.numCols

		let firstInRowIndex = rowIndex * this.numCols
		for (
			let i = firstInRowIndex,
				end = firstInRowIndex + this.numCols - 1,
				asc = firstInRowIndex <= end;
			asc ? i <= end : i >= end;
			asc ? i++ : i--
		) {
			this.remove(firstInRowIndex)
		}

		this.numRows--

		return this
	}

	removeCol(colIndex) {
		if (colIndex == null) {
			colIndex = this.numCols - 1
		}
		this.maxItems -= this.numRows

		for (let i = this.numRows - 1; i >= 0; i--) {
			this.remove(i * this.numCols + colIndex)
		}

		this.numCols--

		return this
	}

	clone(cloneDataFn) {
		if (cloneDataFn == null) {
			cloneDataFn = Util.defaultCloneFn
		}
		let clonedItems = []

		for (let item of this.items) {
			clonedItems.push(item.clone(cloneDataFn))
		}

		return new GridTextGroup(this.numRows, this.numCols, this.dataTemplate, clonedItems)
	}

	toDescriptor(dataToDescriptorFn) {
		if (dataToDescriptorFn == null) {
			dataToDescriptorFn = Util.defaultCloneFn
		}
		let desc = []

		for (let item of this.items) {
			desc.push({ text: item.text.getExportedObject(), data: dataToDescriptorFn(item.data) })
		}

		return {
			textGroup: desc,
			numRows: this.numRows,
			numCols: this.numCols
		}
	}

	__grid_print() {
		let s
		let i, item
		console.log('========================')
		return __range__(0, this.numRows, false).map(
			row => (
				// console.log 'row', row
				(s = []),
				__range__(0, this.numCols, false).map(
					col => (
						// console.log '  col', col
						(i = row * this.numCols + col),
						// console.log '    i', i
						(item = this.items[i]),
						s.push((item.text.value + '          ').substr(0, 10))
					)
				),
				console.log(s)
			)
		)
	}
}
// console.log '---------------------'

// window.GridTextGroup = GridTextGroup

// window.g = new GridTextGroup(2,2)
// g.init(4)
// g.get(0).text.value = 'a0'
// g.get(1).text.value = 'a1'
// g.get(2).text.value = 'b0'
// g.get(3).text.value = 'b1'

export default GridTextGroup

function __range__(left, right, inclusive) {
	let range = []
	let ascending = left < right
	let end = !inclusive ? right : ascending ? right + 1 : right - 1
	for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
		range.push(i)
	}
	return range
}
