/* jslint browser: true, white: true */

// Set up home framework

var JAHOME = {};
JAHOME.idDelimiter = '_';
JAHOME.setFeatureURL = 'data/set-feature.json';

// read & parse "home" object data from server in JSON format
// since we are modifying the JAHOME namespace AND using "use strict", we have to return JAHOME.
// passing in JAHOME for robustness.
JAHOME.initHomeData = function (file, dataTypes, homeID, featureID, containerID) {
	'use strict';
	
	$.get(file, function (data) {
		
		JAHOME.homeData = data[homeID];
		JAHOME.featureData = data[featureID];
		
		// set up the feature types allowed in this home
		JAHOME.featureTypes = JAHOME.initFeatureTypes(JAHOME.featureData, dataTypes);
		
		JAHOME.initControlPanel(homeID, containerID);
	}, 'json');

};

// set up the control panel, using the data already read in
JAHOME.initControlPanel = function (homeID, containerID) {
	'use strict';
    
    // build control panel HTML block into a string, then append to the DOM at the end
    // for better performance.
    var controlHTML = '<div id="home">',

        // features at the whole home level
        homeHTML = JAHOME.featureControlsHTML(JAHOME.featureTypes, JAHOME.homeData.features, homeID),

        // features for each room in the home
        roomHTML = '';

    $.each(JAHOME.homeData.rooms, function (index, element) {
        var domID = homeID + JAHOME.idDelimiter + index;

        // use a div & h3 heading for styling
        roomHTML += '<div id="' + domID + '" class="room"><h3>' + element.name + '</h3>';
        roomHTML += JAHOME.featureControlsHTML(JAHOME.featureTypes, element.features, domID);
        roomHTML += '</div>';
    });

    // finish that new HTML block & append it to the DOM in containerID
    controlHTML += homeHTML;
    controlHTML += roomHTML;
    controlHTML += '</div>';
    $('#' + containerID).append(controlHTML);

    // add the "save feature" listener to all control panel form elements
    $('#' + containerID + ' input').change(JAHOME.saveFeature);
    $('#' + containerID + ' select').change(JAHOME.saveFeature);
    $('#' + containerID + ' textarea').change(JAHOME.saveFeature);
    $('#' + containerID + ' button').change(JAHOME.saveFeature);
};

// here, we take a JSON object describing the different home features available, then
// add functions; functionality won't/shouldn't be part of the actual JSON data,
// using the different supported data types offered in JADATA 
// (an extensible object initialized first in data-types.js)
JAHOME.initFeatureTypes = function (featureTypeData, featureTypeDataTypes) {
	'use strict';
	
	// add the functions & whatnot from the JS data type object	
	$.each(featureTypeData, function (index, element) {
		featureTypeData[index]['data-type-object'] = featureTypeDataTypes[element['data-type']];
	});
		   
	return featureTypeData;
};

// set up features for a space (house or room) in control panel
JAHOME.featureControlsHTML = function (featureTypes, featureList, parentID) {
	'use strict';
	
	var newHTML = '';
		
	// load an array of features - child of either the overall home or one room
	$.each(featureList, function (index, element) {
		var domID = parentID + JAHOME.idDelimiter + index;
		
		newHTML += JAHOME.featureControlHTML(featureTypes[element['feature-type']], element, domID);
	});
	
	return newHTML;
};

// set up one single feature
// this function will replace an existing feature on the page, or will create a new one
JAHOME.featureControlHTML = function (featureType, feature, domID) {
	'use strict';
	
	var newHTML = '<div class="feature">';
	newHTML += featureType['data-type-object'].controlHTML(featureType, feature, domID);
	newHTML += '</div>';

	return newHTML;
};

// onclick event, to save one single feature
// uses initialized JAHOME variables to figure out what needs saving
JAHOME.saveFeature = function () {
	'use strict';
    
	var featureTree = this.id.split(JAHOME.idDelimiter),
        featureKey = featureTree[featureTree.length - 1],
        featureRoom = '',
        featureValue,
        featureType,
        feature,
        doc,
        svgElement,
        svgID = '';

    // the dom ID tells the "parentage" story... 
    // a 3-item ID is inside a room
    if (featureTree.length > 2) {
        featureRoom = featureTree[1];
        feature = JAHOME.homeData.rooms[featureRoom].features[featureKey];
        svgID = JAHOME.homeData.rooms[featureRoom]['svg-id'];
        
    // < 3 items, and it isn't inside a room 
    } else {
        feature = JAHOME.homeData.features[featureKey];
        svgID = JAHOME.homeData['svg-id'];
    }
    
    // get the SVG object so we can animate it
    // using JS dom selection because jQuery was problematic
    doc = document.getElementById('home-map').contentDocument;
	svgElement = doc.getElementById(svgID);
	//svgElement.style.fillOpacity = 0.2;
    
    // the new value depends on the data type, state, & item selected
    // for extensibility yet still somewhat secure, this can be found in the function controlValue() 
    // originally in JADA.
    featureType = JAHOME.featureTypes[feature['feature-type']];
    featureValue = featureType['data-type-object'].controlValue(featureType, feature, this.id);
    featureType['data-type-object'].effect(featureType, feature, this.id, featureValue, svgElement);
    
    // since data persistent is not a requirement,
    // the "save" json file just a stub, and simply returns a success case for 
    // setting a particular feature on the server.    
    $.get(JAHOME.setFeatureURL, {
        "room": featureRoom,
        "key": featureKey,
        "value": featureValue
    }).done(function (data) {
        if (data.success === false) {
            alert("Error saving adjustment: " + data.success);
        }
    }, 'json');
	
};