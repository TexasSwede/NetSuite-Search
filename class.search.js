/**
 * Encapsulate NetSuite search functionality in an easy to use object.
 *  
 * Version    Date            Author           Remarks
 * 1.0        11 Nov 2016     kmartinsson      Initial version
 * 1.5        06 Jul 2017     kmartinsson      Added record type to constructor
 * 2.0        23 Aug 2017     kmartinsson      Added Search2 function, with support for objects and adding multiple columns/filters
 * 2.0.1      01 Sep 2017     kmartinsson      Bug-fixes
 * 2.0.2      01 Sep 2017     kmartinsson      Fixed issue with join not being null, added hasOwnProperty check 
 * 3.0        20 Nov 2017     kmartinsson      Removed v1.x code stream, renamed Search2 to Search
 * 3.0.1      06 Dec 2017     kmartinsson      Added JSDoc style comments, updated comments to new JSDoc style
 * 3.0.2      28 Feb 2018     kmartinsson      Fixed bug in sort key which prevented proper sorting. Added alternative keys.
 * 
 */

/**
 * Search object
 * @constructor
 * @param {string} recordtype - Optional NetSuite recordtype (internalid)
 */
function Search(recordtype) {
	this.recordType = null;
	this.columns = [];
	this.filters = [];
	this.filterExpressions = [];
	// Set internal id of saved search to null
	this.internalId = null;
	// If record type/ID is supplied, set it now, otherwise default to null
	if (recordtype != null && recordtype != "") {
		this.recordType = recordtype;
	}

	// helper function to verify the value is empty or null
	function isNullOrEmpty(val) {
		if (val == null || val == '') {
			return true;
		} else {
			return false;
		}
	}


	/**
	 * Add a column to include in the search
	 * @param {object}|{string} column - Object specifying a column to return or string containing columnId
	 * @param {string} join - Joined record (internalid) (optional)
	 * @param {boolean}|{string} sorting - Sorting (optional)
	 *         Options: true = descending, false = ascending, empty/null = no sorting, "yes" (ascending), 
	 *         "no", "ascending", "descending" (can be abbreviated "a" and "d" respectively).
	 */
	this.addColumn = function(column, join, sorting) {
			var nsSearchColumn = null;
			var paramColName = null;
			var paramJoin = null;
			var paramSummary = null;
			var paramSorted = null;
			// Check if first argument is string or object
			if (typeof column == "string") {
				paramColName = column;
				// Check if second argument is null (for no join)
				if (isNullOrEmpty(join)) {
					paramJoin = null;
					// Check if arguent for sorting was provided
					if (!isNullOrEmpty(sorting)) {
						paramSorted = sorting;
					}
				} else {
					// Check if second argument is boolean, then it is not 'join' but 'sorting'
					if (typeof join == "boolean") {
						paramSorted = join;
						paramJoin = null;
					} else {
						paramSorted = sorting;//sorted;
						paramJoin = join;
					}
				}
				// Now paramJoin and paramSorted are assigned properly
				if (typeof paramSorted == "boolean") {
					if (paramSorted == true) {
						paramSorted = "des";
					} else {
						paramSorted = "asc";
					}
				} else if (typeof paramSorted == "string") {
					// Get first character of string, in lower case
					var tmp = paramSorted.slice(0, 1).toLowerCase();
					// y = ascending sorting, n = no sorting, a = ascending, d = descending
					if (tmp == 'y' || tmp == 'a') {
						paramSorted = "asc";
					} else if (tmp == 'd') {
						paramSorted = "des";
					} else {
						paramSorted = null;
					}
				}

			} else {
				if (column.hasOwnProperty("name") && column.name != null) {
					paramColName = column.name;
				} else if (column.hasOwnProperty("columnName") && column.columnName != null) {
					paramColName = column.columnName;
				} else if (column.hasOwnProperty("columnname") && column.columnname != null) {
					paramColName = column.columnName;
				} else if (column.hasOwnProperty("column") && column.column != null) {
					paramColName = column.columnName;
				} else {
					throw nlapiCreateError('search.addColumn() - Required Argument Missing', 'The required argument <em>columnName</em> is missing. This argument is required.<br>Received: ' + JSON.stringify(column));
				}
				if (column.hasOwnProperty("join") && column.join != null) {
					paramJoin = column.join;
				}
				if (column.hasOwnProperty("summary") && column.summary != null) {
					paramSummary = column.summary;
				}
			}
			nsSearchColumn = new nlobjSearchColumn(paramColName, paramJoin, paramSummary);
			// Check if 'sorted' value exists in object
			if (column.hasOwnProperty("sorted") && column.sorted != null) {
				// Get first 3 characters as lower case
				paramSorted = column.sorted.toLowerCase().substring(0, 3);
			} else if (column.hasOwnProperty("sorting") && column.sorting != null) {
				// Get first 3 characters as lower case
				paramSorted = column.sorting.toLowerCase().substring(0, 3);
			} else if (column.hasOwnProperty("sort") && column.sort != null) {
				// Get first 3 characters as lower case
				paramSorted = column.sort.toLowerCase().substring(0, 3);
			}
			if (paramSorted!= null && paramSorted!="") {
				if (paramSorted == "asc") {
					nsSearchColumn.setSort(false);
				} else if (paramSorted == "des") {
					nsSearchColumn.setSort(true);
				} else {
				}
			}
			// Check if 'formula' value exists in object, then add to column object
			if (column.hasOwnProperty("formula") && column.formula != null) {
				nsSearchColumn.setFormula(column.formula);
			}
			// Check if 'functionId' value exists in object, then add to column object
			if (column.hasOwnProperty("functionId") && column.functionId1 != null) {
				nsSearchColumn.setFunction(column.functionId);
				// Push new nlobjSearchColumn into array
			}
			// Check if 'label' value exists in object, then add to column object
			if (column.hasOwnProperty("label") && column.label != null) {
				nsSearchColumn.setLabel(column.label);
			}
			this.columns.push(nsSearchColumn);
			return nsSearchColumn;
		} // end function addColumn


	/**
	 * Add multiple columns to include in the search
	 * @param {array} columns - array of column objects
	 */
	this.addColumns = function(columns) {
			for (var i = 0; i < columns.length; i++) {
				this.addColumn(columns[i]);
			}
		} // end function addColumns

	/**
	 * Add a search filter
	 * @param {object}|{string} filter - filter object or string containing fieldId
	 * @param {string} fieldJoinId - field to use for join (optional)
	 * @param {string} operator - operator for filter (optional)
	 * @param {string} value - value to filter for (optional)
	 */
	this.addFilter = function(filter, fieldJoinId, operator, value) {
			if (typeof filter == "object") {
				var obj = filter;
				var fieldId = obj.field;
				var fieldJoinId = null;
				if (filter.hasOwnProperty("join")) {
					fieldJoinId = obj.join;
				}
				var operator = obj.operator;
				var value = obj.value;
				// Create filter object
				var nsSearchFilter = new nlobjSearchFilter(fieldId, fieldJoinId, operator, value);
				// Check if 'formula' value exists in object, then add to filter object
				if (obj.hasOwnProperty("formula") && obj.formula != null) {
					nsSearchFilter.setFormula(obj.formula);
				}
				// Check if 'functionId' value exists in object,then add to filter object
				if (obj.hasOwnProperty("functionId") && obj.functionId != null) {
					nsSearchFilter.setFunction(obj.functionId);
				}
				this.filters.push(nsSearchFilter);
			} else {
				var fieldId = filter;
				this.filters.push(new nlobjSearchFilter(fieldId, fieldJoinId, operator, value));
			}
		} // end function addFilter


	/**
	 * Add multiple search filters
	 * @param {array}filters - array of filter objects
	 */
	this.addFilters = function(filters) {
			for (var i = 0; i < filters.length; i++) {
				this.addFilter(filters[i]);
			}
		} // end function addFilters

	/**
	 * Add filter expression
	 * @param {array} expression - array structure describing search expression
	 */
	this.addFilterExpression = function(expression) {
		this.filters.push(JSON.parse(expression));
	}

	/**
	 * Set the type of record to search for
	 * @param {string} type - internalid of record type to search for
	 */
	this.setRecordType = function(type) {
			this.recordType = type;
		} // end function setRecordType


	/**
	 * Use an existing saved search as starting point for this search
	 * @param {string} internalid - internalid of existing saved search
	 */
	this.useSavedSearch = function(internalid) {
			this.internalId = internalid;
		} // end function useSavedSearch


	/**
	 * Return search results as a nlobjSearchResult object
	 * @param {string} recordtype - Optional NetSuite recordtype (internalid)
	 */
	this.getResults = function(recordtype) {
			var results = [];
			if (recordtype != null && recordtype != "") {
				this.recordType = recordtype;
			}
			if (this.internalId != null) {
				// If internal id of a saved search is provided, load 
				// that saved search and create a new search based on it
				var savedsearch = nlapiLoadSearch(this.recordType, this.internalId);
				// Add new filters to saved filters
				var newfilters = savedsearch.getFilters().concat(this.filters);
				// Add new columns to saved columns
				var newcolumns = savedsearch.getColumns().concat(this.columns);
				// Perform the search
				var newsearch = nlapiCreateSearch(savedsearch.getSearchType(), newfilters, newcolumns);
				// 
			} else {
				// Otherwise build the search ad-hoc and set columns and filters
				var newsearch = nlapiCreateSearch(this.recordType, this.filters, this.columns);
			}
			var resultset = newsearch.runSearch();
			// Loop through the search result set 900 results at a time and build an array
			// of results. This way the search can return more than 1000 records.
			var searchid = 0;
			do {
				var resultslice = resultset.getResults(searchid, searchid + 900);
				for (var rs in resultslice) {
					results.push(resultslice[rs]);
					searchid++;
				}
			} while (resultslice != null && resultslice != undefined && resultslice.length >= 900);
			return results;

		} // end function getResults

} // end class search