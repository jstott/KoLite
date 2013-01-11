/*global ko: false*/
// By: Hans James Stott
// https://github.com/jstott/KoLite.git
//
// Knockout.pagedObservableArray
//
// John Papa 
//          http://johnpapa.net
//          http://twitter.com/@john_papa
//
// Depends on scripts:
//			jquery
//          Knockout
//
//  Notes:
//          Special thanks to John Papa and Steve Greatrex for 
//          their examples.
//
//  Usage:      
//          To Setup Tracking, add this tracker property to your viewModel    
//              ===> pagedRosters = ko.pagedObservableArray({
//            serverPaging: true,
//            pageSize: 5,
//            loadPage: function(options) { // options will contain contents of parameterMap or pageSize/pageIndex
//                var def = $.Deferred();
//                model.Roster.datacontext.getRosterClasses(df, options);
//                return df;
//            },
//           parameterMap: function(options) {
//                var parameters = {
//                    id: config.currentUser().id(),
//                    //additional parameters sent to the remote service
//                   pageSize: options.pageSize,
//                    page: options.pageIndex + 1 //next page
//                };
//                return parameters;
//            },
//            schema: { // describe the result format
//                data: "Data", // the data which the data source will be bound to is in the "results" field
//                count: "Count"
//            }
//        })
//
//          
////////////////////////////////////////////////////////////////////////////////////////

(function (factory) {
    // Module systems magic dance.

    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS or Node: hard-coded dependency on "knockout"
        factory(require("knockout"), exports);
    } else if (typeof define === "function" && define["amd"]) {
        // AMD anonymous module with hard-coded dependency on "knockout"
        define(["knockout", "exports"], factory);
    } else {
        // <script> tag: use the global `ko` object, attaching a `mapping` property
        factory(ko, ko.mapping = {});
    }
}(function (ko, exports) {
    "use strict";

    ko.pagedObservableArray = function (options) {
        if (!options) { throw "Options not specified"; }
        if (!options.loadPage) { throw "loadPage not specified on options"; }

        var
		//the complete data collection
	     _allData = ko.observableArray(options.data || []),

		//the size of the pages to display
	     _pageSize = ko.observable(options.pageSize || 10),

		//the index of the current page
	     _pageIndex = ko.observable(0),

		//the total count
		_totalCount = ko.observable(0);
		
		//the number of pages
		_pageCount = ko.computed(function () {
			if (_totalCount() > 0)
				return Math.ceil(_totalCount() / _pageSize()) || 1;
			else
				return Math.ceil(_allData().length / _pageSize()) || 1;
		}),
			
		//the current page data
		_page = ko.computed(function () {
			var pageSize = _pageSize(),
				pageIndex = _pageIndex(),
				startIndex = pageSize * pageIndex,
				endIndex = pageSize * (pageIndex + 1);

			return _allData().slice(startIndex, endIndex);
		}, this),

		//load a page of data, then display it
		_loadPage = function() {
			var dfdCallback,
				paramOptions = {pageSize: _pageSize(), pageIndex: pageIndex()};
			if (options.parameterMap)
				paramOptions = options.parameterMap(paramOptions);
			dfdCallback = options.loadPage(paramOptions);
			$.when(dfdCallback).then(function (data, status) {
                    if (status === 'success') {
                        console.dir(data);
                        console.log(status);
                    }
                });
		},
		
		
		//move to the next page
	        _nextPage = function () {
	            if (_pageIndex() < (_pageCount() - 1)) {
	                _pageIndex(_pageIndex() + 1);
					_loadPage();
	            }
	        },

		//move to the previous page
	        _previousPage = function () {
	            if (_pageIndex() > 0) {
	                _pageIndex(_pageIndex() - 1);
					_loadPage();
	            }
	        };

        //reset page index when page size changes
        _pageSize.subscribe(function () { _pageIndex(0); });
        _allData.subscribe(function () { _pageIndex(0); });

		if (options.autoLoad)
			_loadPage();
			
        //public members
        this.allData = _allData;
        this.pageSize = _pageSize;
        this.pageIndex = _pageIndex;
        this.page = _page;
        this.pageCount = _pageCount;
        this.nextPage = _nextPage;
        this.previousPage = _previousPage;
		this.totalCount = _totalCount;
    };
}));