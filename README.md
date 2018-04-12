# NetSuite-Search

This library encapsulates the NetSuite search functionality and simplifies writing searches in SuiteScript 1.0.
It also has the advantage of making the code shorter, cleaner and easier to read/maintain, while still keeping the 


## Constructor 
`Search()`  
####or  
`Search(recordid)`  
The constructor can be called with or without the internalid of the record type to search for. 
If no recordid is provided, it has to be added later through a call to setRecordType(), or the search will fail.

## Function addColumn 
`addColumn(columnName,join, sorted)`  
Define a column to be returned with the search result. The first parameter is required, and is a string containing the internalid of the field to return.
The second parameter is optional. It is the join to use, and it is a string containing the internalid of the field to use for the join.
The last parameter is optional. It is a boolean value, true for descending sort order, false for ascending. Omitted or null means no sorting is done.     
See `nlobjSearchColumn` in SuiteAnswers for more details.

#####or

`addColumn(object)`  
Object values:  
- columnName	- String, required. The search return column name.
- name		    - alias for columnName  
- join        - String, optional. The join id for this search return column.  
- summary     - String, optional. Can be any of the NetSuite summary values:  
                  group  
                  sum  
                  count  
                  avg  
                  min  
                  max  
- sorted		  - Boolean or String, optional. If not set, defaults to false, which returns column data in ascending order. If set to true, data is returned in descending order. Can also use "acending"/"asc" and "descending"/"desc" as alternative.
- formula     - String, optional. Set the formula used for this column. Name of the column can either be formulatext, formulanumeric, formuladatetime, formulapercent, or formulacurrency.
- functionId  - String, optional. Sets the special function used for this column. See `.setFunction()` in SuiteAnswers foir more info.


## Function addColumns
`addColumns(array)`  
Accepting an array of objects identical to the one used in `addColumn`.


## Function addFilter  
`addFilter(object)`  
####or  
`addFilter(fieldname, join, operator, value)`  
Define a column to be returned with the search result. 
See `nlobjSearchFilter` in SuiteAnswers.

Object values:  
- field  
- join  
- operator  
- value  
- formula  
- functionId  


## Function addFilters  
`addFilters(array)`  
Accepting an array of objects identical to the one used in addFilter.


## Function useSavedSearch  
`useSavedSearch(savedsearchId)`  
Configure the search to use a specified saved search as starting point for the search.
The saved search id can be either numeric or a string.


## Function setRecordType  
`setRecordType(recordtype)`  
Specify the record type to search form. Not needed if specified in the constructor.


## Function getResults  
`getResults()`  
Returns a nlobjSearchResult object.


### Example Code ###
```javascript
var search = new Search2('case');
search.addColumn({"name":"internalid"});
search.addColumn({"name":"itemname","sorted":true});
search.addColumn({"name":"createddate"});
search.addColumn({"name":"item", "join":"createdfrom" });
search.addColumn("custrecord_importance");
search.addColumn("tranid","createdfrom");
search.addFilter({"field":"custrecord_category","operator":"is","value":category});
search.addFilter("custrecord_age",null,"is",age);
var results = search.getResults();

```
