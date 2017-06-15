var JADATA = {
	"dataTypes": {
		
		// the boolean data type is behind the lights & curtains in the app.
		"boolean": {
			
			// this function should return the HTML needed to create the control on the page
			// why not just add it to the dom here?  
			// save everything up & add it at once, for better performance.
			"controlHTML": function (featureType, feature, domID) {
				'use strict';

				var newHTML,
					checked = '';

				if (feature['current-value'] === featureType['true-value']) {
					checked = ' checked="checked" ';
				}

				newHTML = '<input type="checkbox" id="' + domID + '" class="boolean" value="' + featureType['true-value'] + '" ' + checked + '/>';
				newHTML += '<label for="' + domID + '" class="boolean">' + feature.name + '-' + featureType['true-value'] + '</label>';

				return newHTML;
			},
			
			// return the feature control’s actual value,
			// here we have abstraction! it may or may not be what is in the form field
			"controlValue": function (featureType, feature, domID) {
				'use strict';

				// if the box is checked, you can use its value
				if ($('#' + domID).prop('checked')) {

					return featureType['true-value'];

				// if the box isn't checked, use the feature type's "off" value
				} else {

					return featureType['false-value'];

				}
			},
			
			// call this function to animate the feature in the SVG
			"effect": function (featureType, feature, domID, controlValue, svgElement) {
				'use strict';

				// adjust the light level by 0.2 due to curtains or lights on/off
				var lightLevel = (svgElement.style.fillOpacity.length > 0) ? parseFloat(svgElement.style.fillOpacity) : 0.5;
				if (controlValue === featureType['true-value']) {
					svgElement.style.fillOpacity = lightLevel + featureType['true-opacity-change'];
				} else {
					svgElement.style.fillOpacity = lightLevel + featureType['false-opacity-change'];
				}

			}
		},
		
		// the integer data type powers the temperature control
		"integer": {

			// this function should return the HTML needed to create the control on the page
			// why not just add it to the dom here?  
			// save everything up & add it at once, for better performance.
"controlHTML": function (featureType, feature, domID) {
				'use strict';

				var newHTML = '<label for="' + domID + '" class="integer"> ' + feature.name + ':</label>';
				newHTML += '<input type="number" class="integer" min="' + featureType.min + '" max="' + featureType.max + '" ';
				newHTML += 'id="' + domID + '" value="' + feature['current-value'] + '" /><span class="units">' + featureType.units + '</span>';

				return newHTML;
			},

			// return the feature control’s actual value,
			// here we have abstraction! it may or may not be what is in the form field
			"controlValue": function (featureType, feature, domID) {
				'use strict';

				return $('#' + domID).value;
			},

			// call this function to animate the feature in the SVG
			"effect": function (featureType, feature, domID, controlValue, svgElement) {
				'use strict';
			}
		}
	}
};