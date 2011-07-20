// Copyright 2011 Genability 

// Licensed under the Apache License, Version 2.0 (the "License"); 
// you may not use this file except in compliance with the License. 
// You may obtain a copy of the License at 

// http://www.apache.org/licenses/LICENSE-2.0 

// Unless required by applicable law or agreed to in writing, software 
// distributed under the License is distributed on an "AS IS" BASIS, 
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
// See the License for the specific language governing permissions and 
// limitations under the License.

// api global variables
// var COUNT = 0; // for debugging only
var AUTHORIZE = new Keys();
var API_ID = AUTHORIZE.api_id;
var API_KEY = AUTHORIZE.api_key;
var API_ROOT_URL = "http://api.genability.com/rest/public/";
var TARIFFS_API = "tariffs";
var TERRITORY_API = "territories";
var LSES_API = "lses";
var PRICES_API = "prices";
var SEASONS_API = "seasons";
var API_AUTH_STRING = "?appId="+API_ID+"&appKey="+API_KEY; // https://developer.genability.com/signup

// badge colors
var LOADING = [103,103,103,255];
var FIXED = [57,181,74,255];
var LOW = [57,181,74,255];
var MID = [217,224,73,255];
var HIGH = [247,147,30,255];
var HIGHEST = [193,39,45,255];
var LOADING_HEX = "#666666";
var FIXED_HEX = "#39B54A";
var LOW_HEX = "#39B54A";
var MID_HEX = "#D9E021";
var HIGH_HEX = "#F7931E";
var HIGHEST_HEX = "#C1272D";

// average consumer power consumption
var JAN = 1746;
var FEB = 1686;
var MAR = 1546;
var APR = 956;
var MAY = 809;
var JUN = 809;
var JUL = 1008;
var AUG = 878;
var SEP = 678;
var OCT = 900;
var NOV = 1085;
var DEC = 1503;
var monthArray = [JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC];
var monthStrings= ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var currDate = new Date();
var currMonth = currDate.getMonth();
console.log(currDate);

// timer vars for loading animation
var TIMER;
var TIMER_IS_ON = 0;

// animation durations
var FADE_IN_DURATION = 400;

$(document).ready(function(){
	// localStorage.clear();
	// load widget if zipcode is available or options if it is not
	if(localStorage.zipCode != undefined){
		if(localStorage.chosenPlan != undefined){
			loadWidget();
		} else {
			loadTariffs();	
		}
	} else {
		loadTariffs();	
	}
	
	// click handler for the options button
	$(".options").click(function(){
		$(this).hide();
		if (localStorage.zipCode != undefined) {
			localStorage.zipCodeSearch = localStorage.zipCode;
		}
		loadTariffs();
	});
});

// load the plans for the zipcode
function loadTariffs(json){
	$('#options').show();
	$("#error").hide();
	$("#widget").hide();
	// build zip_code form
	var zip_form = $("<form/>").attr("id", "choose_zip").attr("action", API_ROOT_URL+TARIFFS_API).appendTo("#options.page");
	var zip_label = $("<label/>").attr("for", "zip_code").attr("class", "zcode").html("Zip Code").appendTo(zip_form);
	var zip_input = $("<input/>").attr("id", "zip_code").attr("name", "zip_code").attr("class", "text_input").appendTo(zip_form);
	$("<input/>").attr("type", "submit").attr("class", "save").attr("value", "SAVE").appendTo(zip_form);
	// load zipCode if stored in local Storage
	if (localStorage.zipCodeSearch != undefined) {
		$("#zip_code").val(localStorage.zipCodeSearch);
	} else {
		$("#zip_code").val(localStorage.zipCode);
	}
	$("<br/>").appendTo(zip_form);
	
	// build plans form
	var plan_form = $("<form/>").attr("id", "rate_plans").appendTo("#options.page");
	var rate_plan = $("<p/>").attr("class", "rate_plan").html("Rate Plan ").appendTo(plan_form).hide();
	var plans_div = $("<div/>").attr("id", "plans").appendTo(plan_form).hide();

	// if a plan is already selected, show edit option
	if (localStorage.tariffName != undefined && localStorage.lseName != undefined) {
		var plans_div_o = $("<div/>").attr("id", "plans_o").appendTo("#options.page");
		var rate_plan_o = $("<p/>").attr("class", "rate_plan").html("Current Rate Plan ").appendTo(plans_div_o);
		$("<a/>").attr("class", "edit_plans_o").html("edit").appendTo(rate_plan_o);
		var planHolder = $("<span/>").attr("class", "planHolder");
		$("<label/>").addClass("radio_txt").html(localStorage.tariffName).appendTo(planHolder);
		$("<br/>").appendTo(planHolder);
		$("<span/>").addClass("lseName").html(localStorage.lseName).appendTo(planHolder);
		planHolder.appendTo(plans_div_o);
	}

	// if localStorage.monthlyConsumption set, display option
	if (localStorage.monthlyConsumption != undefined && !isNaN(localStorage.monthlyConsumption)) {
		var con_form = $("<form/>").attr("id", "choose_con").attr("action", API_ROOT_URL+TARIFFS_API).appendTo("#options.page");
		var con_label = $("<label/>").attr("for", "consumption_o").attr("class", "zcode").html("Monthly Consumption").appendTo(con_form);
		var con_input = $("<input/>").attr("id", "consumption_o").attr("name", "consumption_o").attr("class", "text_input").appendTo(con_form);
		$("<input/>").attr("type", "submit").attr("class", "save").attr("value", "SAVE").appendTo(con_form);
		// load monthlyConsumption if stored in local Storage
		$("#consumption_o").val(localStorage.monthlyConsumption);
		$("<br/>").appendTo(con_form);
	}
	
	// if json object is valid build the input fields for the plans
	if(json && json.results.length > 0){
		console.log("Logging tariffs");
		var plans = $.each(json.results, function(i,result){
			var planHolder = $("<span/>").attr("class", "planHolder");
			var chkId = 'chk' + i;
	      	$("<input/>").attr("class", "plan").attr("type", "radio").attr("name", "tarriffNames").attr("idx", i).attr("value", result.masterTariffId).appendTo(planHolder).attr("id", chkId);
			$("<label/>").addClass("radio_txt").attr("for", chkId).html(result.tariffName).appendTo(planHolder);
			$("<br/>").appendTo(planHolder);
			$("<span/>").addClass("lseName").html(result.lseName).appendTo(planHolder);
			planHolder.appendTo(plans_div);
			plans_div.show();
			rate_plan.show();
			$("#plans_o").remove();
			$("#choose_con").remove();
			console.log(result);
	    });
		var div = $("<div/>").attr("id", "buttons").appendTo(plans_div);
		//$("<a/>").attr("class", "btn").attr("id", "cancel").html("<span>CANCEL</span>").appendTo(div);
		var plan_submit = $("<input/>").attr("type", "submit").attr("value", "SUBMIT").appendTo(div).hide();
	} else if (json) {
		console.log("Tariff has no rate data.");
		$('#plans').html('<p class="incomplete">We do not yet have complete rates for '+localStorage.zipCodeSearch+'.<br /> <a href="http://whatsmypower.com/locations/'+localStorage.zipCodeSearch+'" title="whatsmypower.com" target="_blank">More info.</a></p>');
		plans_div.show();
		$("#plans_o").remove();
		$("#choose_con").remove();
	}
	
	// hide all other plans when a plan is chosen, show estimate field
	$(".plan").change(function () {
		$(".plan:checked").each(function () {
			localStorage.tarrifId = $(this).val();
			// storing json object as string in local storage as objects won't work
			var result_string = JSON.stringify(json.results[$(this).attr("idx")]);
			localStorage.tariff = result_string;
			console.log(localStorage.tariff);
			var planHolders = $(".planHolder");
			var thisPlanHolder = $(this).parent("span");
			$(thisPlanHolder).addClass("selected_plan");
			var estimateHolder = $("<span/>").attr("class", "estimateHolder");
			$("<p/>").attr("class", "kilowatts").html("Monthly Consumption in kWh").appendTo(estimateHolder);
			$("<input/>").attr("name", "estimate").attr("class", "consumption text_input").appendTo(estimateHolder).attr("placeholder", monthArray[currMonth]);
			$("<br/>").appendTo(estimateHolder);
			estimateHolder.appendTo(thisPlanHolder.parent());
			$("<p/>").attr("class", "info").html("This figure can be found on your electric bill or on your energy provider's website. <strong>If you leave this blank we will use the national average.</strong>").appendTo(estimateHolder);
			planHolders.not(thisPlanHolder).toggle();
			// create edit button for plans form
			$("<a/>").attr("class", "edit_plans").html("edit").appendTo(rate_plan);
			plan_submit.show();

			var retrievedObject = localStorage.tariff;
			var encoded = JSON.parse(String(retrievedObject));
			var url = API_ROOT_URL+TERRITORY_API+API_AUTH_STRING+"&masterTariffId="+encoded.masterTariffId+"&containsItemType=ZIPCODE&containsItemValue="+localStorage.zipCodeSearch;
			console.log("url: "+url);
			var jqxhr = $.getJSON(url, function(json) {
			})
			.success(function(territoryJSON) {
				if(territoryJSON.results.length > 0){
					localStorage.territoryId = territoryJSON.results[0].territoryId;
				}
			})
			.error(function(json) { 
				loadErrorScreen(json); 
				console.log("ERROR:setTerritoryId:");
				console.log(json);
				console.log("retrievedObject:");
				console.log(retrievedObject);
				console.log("encoded:");
				console.log(encoded);
				localStorage.clear();
			})
			.complete(function(json) {});
		});
		
		$(".edit_plans").click(function(event) {
			plan_form.remove();
			zip_form.remove();
			loadTariffs(json);
		});
    }).change();

	// pressing edit is actually the same as saving a zipcode
	$(".edit_plans_o").click(function(event) {
		$("#choose_zip").submit();
	});

	// attach a submit handler to the zip_code form	
	$("#choose_zip").submit(function(event) {
		//localStorage.clear();
		//chrome.browserAction.setBadgeText({text:''});
		plan_form.remove();
		$("#plans_o").remove();
		$("#choose_con").remove();
		//con_form.remove();
		//plans_div_o.hide();
		$("#choose_zip .incomplete").remove();
		$("#choose_zip input[type=submit]").attr('disabled','disabled');
		// stop form from submitting normally
		event.preventDefault(); 
		// get some values from elements on the page:
		var $form = $(this),
			term = $form.find('input[name="zip_code"]').val(),
			url = $form.attr('action');
		url = url+API_AUTH_STRING+"&zipCode="+term+"&customerClasses=RESIDENTIAL&tariffTypes=DEFAULT,ALTERNATIVE";

		if (/(^\d{5}$)/.test(term)) {
			localStorage.zipCodeSearch = term;
			// start loading animation
			loadUpdatingModal("start");
			// Assign handlers immediately after making the request, and remember the jqxhr object for this request
			var jqxhr = $.getJSON(url, function(json) {
				//console.log(json);
			})
			.success(function(json) { 
				plan_form.remove();
				zip_form.remove();
				// clearing pricesJSON so the app makes a new pull for the new tariff.
				localStorage.removeItem("pricesJSON");
				localStorage.tariffs = json;
				console.log("json object being passed to loadTariffs();");
				console.log(json);						
				loadTariffs(json);
			})
			.error(function(json) {
				loadErrorScreen(json); 
				console.log("ERROR:choose_zip:");
				console.log(json);
				localStorage.clear();	
			}).complete(function(json) {			
				loadUpdatingModal("stop");
				$("#choose_zip input[type=submit]").removeAttr('disabled');
			});
		} else {
			$("#choose_zip input[type=submit]").removeAttr('disabled');
			$('#choose_zip').append('<p class="incomplete">Please enter a valid 5 digit zip code.</p>');
		}
	});

	//attach a submit handler to the choose_con form
	$("#choose_con").submit(function(event) {
		localStorage.monthlyConsumption = $("#consumption_o").val();
		loadWidget();
	});
	
	// attach a submit handler to the plans form	
	$("#rate_plans").submit(function(event) {
		// stop form from submitting normally
		event.preventDefault();
		localStorage.zipCode = localStorage.zipCodeSearch;
		// get some values from elements on the page:
		var $form = $(this),
			chosen_plan = $form.find('input:checked').val();
			if (chosen_plan != undefined) {
				localStorage.chosenPlan = chosen_plan;
			localStorage.monthlyConsumption = $(".consumption").val();
		//$("<p/>").html(chosen_plan + " " + localStorage.monthlyConsumption).appendTo("#wrapper");
		$("#widget").fadeIn(FADE_IN_DURATION).show();
		if($(".consumption").val()) {
			console.log("$(consumption) = "+$(".consumption").val());
			localStorage.monthlyConsumption = $(".consumption").val();
			console.log("Monthly Consumption: USER_INPUT: "+localStorage.monthlyConsumption);
		} else {
			localStorage.monthlyConsumption = monthArray[currMonth];
			console.log("Monthly Consumption: DEFAULT: "+monthArray[currMonth]);
		}
		loadWidget();
			}
	});
	
	// setup cancel button functionality
	//$('#cancel').click(function() {
	//	self.close();
	//});
}

function loadWidget() {
	if(localStorage.tariffs != undefined){
		$(".options").fadeIn(FADE_IN_DURATION).show();
		// clear options div
		$("#options").hide();
		$("#options").html("");
		// populate the widget area with data
		loadCustomerTariff();
	} else {
		loadTariffs();
	}
	
}

function loadCustomerTariff() {
	if($("#widget")){$("#widget").hide()};	
	loadUpdatingModal("start");
	var retrievedObject = localStorage.tariff;
	var encoded = JSON.parse(String(retrievedObject));

	loadWidgetData(encoded);
}

function loadCityState(masterTarrifId) {
	// lses does not return the data I was told it was. Need to verify where to get that data. 
	var url = API_ROOT_URL+LSES_API+"/"+masterTarrifId+API_AUTH_STRING;
	console.log("url: "+url);
	var jqxhr = $.getJSON(url, function(lsesJson) {
	  //alert("success");
	})
	.success(function(lsesJson) { 
		console.log(lsesJson.results[0].cityMixedCase + ", " + lsesJson.results[0].state);
		return lsesJson.results[0].cityMixedCase + ", " + lsesJson.results[0].state;
	})
	.error(function(lsesJson) { 
		loadErrorScreen(lsesJson); 
		console.log("ERROR:loadCityState:");
		console.log(lsesJson);
	})
	.complete(function(json) {});
}

function gmtOffset(offset) { // get military offsetHours ex: -0700
	var stringOffset = String((offset/60)*100);
	if (stringOffset.substr(0,1) != "-") {
		stringOffset = "+" + stringOffset;
	}
	while (stringOffset.length != 5) {
		stringOffset = stringOffset.substr(0,1) + "0" + stringOffset.substr(1,stringOffset.length);
	}
	return stringOffset;
	
}

function loadWidgetData(tariffJSON) {
	currDate = new Date();
	var gmtHours = gmtOffset(-currDate.getTimezoneOffset());
	//var currentTime = currDate.getUTCFullYear() + "-" + (currDate.getUTCMonth()+1) + "-" + currDate.getUTCDate() + "T" + currDate.getUTCHours() + ":" + currDate.getUTCMinutes() + ":" + currDate.getUTCSeconds() + ".0" + gmtHours;
	var currentTime = currDate.getFullYear() + "-" + pad(currDate.getMonth()+1,2) + "-" + pad(currDate.getDate(),2) + "T" + pad(currDate.getHours(),2) + ":" + pad(currDate.getMinutes(),2) + ":" + pad(currDate.getSeconds(),2) + ".0" + encodeURIComponent(gmtHours);
	console.log("currentTime");
	console.log(currentTime);
	// detect if the tariff has territories and use either the territoryId or tariffId to lookup the rate
	var RATE_KEY;
	if(localStorage.territoryId){
		RATE_KEY = "&territoryId="+localStorage.territoryId;
	} else {
		RATE_KEY = "&tariffId="+localStorage.tariffId;
	}
	var pricesUrl = API_ROOT_URL+PRICES_API+"/"+tariffJSON.masterTariffId+API_AUTH_STRING+"&fromDateTime="+currentTime+RATE_KEY+"&consumptionAmount="+localStorage.monthlyConsumption;
	if (localStorage.pricesJSON != undefined) {
		var retrievedObject = localStorage.pricesJSON;
		var decodedPricesJSON = JSON.parse(String(retrievedObject));
		console.log("decodedPricesJSON");
		console.log(decodedPricesJSON);
		displayData(decodedPricesJSON, tariffJSON, pricesUrl);
	} else {
		console.log("301: else");
		// ajax call for price
		var jqxhr = $.getJSON(pricesUrl, function(json) {
		})
		.success(function(pricesJSON) {
			// Uncomment this block to create a situation where the widget will change badge and price 30 seconds from reload
			// if (COUNT < 1) {
			//	var d1 = new Date (),
			//	    d2 = new Date ( d1 );
			//	d2.setSeconds ( d1.getSeconds() + 30 );
			//	pricesJSON.results[0].priceChanges[0].changeDateTime = d2;
			//	pricesJSON.results[0].priceChanges[0].rateAmount = 50;
			//	pricesJSON.results[0].rateAmount = 50; 
			//	COUNT++;
			//}
			var result_string = JSON.stringify(pricesJSON);
			// store value locally and reset global prices variable
			localStorage.pricesJSON = result_string;
			PRICES_JSON = JSON.parse(String(localStorage.pricesJSON));
			displayData(pricesJSON, tariffJSON, pricesUrl);
		})
		.error(function(json) {
			loadErrorScreen(pricesUrl);
			console.log("ERROR:loadWidgetData:priceUrl:");
			console.log(json);
			console.log("pricesUrl");
			console.log(pricesUrl);
			localStorage.clear();	
		})
		.complete(function(json) {});

		// ajax call for seasons for season
		var seasonUrl = API_ROOT_URL+SEASONS_API+API_AUTH_STRING+"&lseId="+tariffJSON.lseId;
		var jqxhr = $.getJSON(seasonUrl, function(json) {
		})
		.success(function(seasonJSON) { 
			console.log(seasonJSON.results[0].seasons);
			$(".season").html(seasonJSON.results[0].seasons[0].seasonName);
		})
		.error(function(json) { 
			loadErrorScreen(json); 
			console.log("ERROR:loadWidgetData:seasonUrl:");
			console.log(json);
		}).complete(function(json) {});
	}
}

function displayData(pricesJSON, tariffJSON, pricesUrl) {
	loadUpdatingModal("stop");
	if($("#widget")){$("#widget").fadeIn(FADE_IN_DURATION).show()};
	$("inner_wrapper").text(pricesUrl);
	$("#widget p").html("");
	$("#widget .details").html("");
	console.log(tariffJSON);
	$(".territory").html('Zip Code '+localStorage.zipCode);
	// Check for charge types and write them to the tariffChargeTypes array
	var chargeTypes;
	var tariffChargeTypes = [];
	for(i=0;i<pricesJSON.results.length;i++){
		switch(pricesJSON.results[i].chargeType){
			case "FIXED_PRICE":
				tariffChargeTypes[0] = ("Fixed");
				break;
			case "MINIMUM":
				tariffChargeTypes[1] = ("Minimum");
				break;
			case "DEMAND_BASED":
				tariffChargeTypes[2] = ("Demand");
				break;
		}
	}
	// Remove undefined charge types from the array
	for(i=0;i<tariffChargeTypes.length;i++){
		if(tariffChargeTypes[i] == undefined){
			tariffChargeTypes.splice(i,1);
			i--;
		}
	}
	// Write the tariffChargeTypes array to a human readable list
	switch(tariffChargeTypes.length){
		case 1:
			chargeTypes = tariffChargeTypes[0];
			break;
		case 2:
			chargeTypes = tariffChargeTypes.join(' and ');
			break;
		case 3:
			tariffChargeTypes[2] = 'and '+tariffChargeTypes[2];
			chargeTypes = tariffChargeTypes.join(', ');
			break;
	}
	var detailsUl = $(".details");
	if(chargeTypes){$("<li/>").html("This plan has " +chargeTypes+ " charges.").appendTo(detailsUl);}
	$("<li/>").html('<a href="http://whatsmypower.com/locations/'+localStorage.zipCode+'/rates/'+tariffJSON.tariffId+'" title="whatsmypower.com" target="_blank">Your electricity plan details.</a>').appendTo(detailsUl);
	localStorage.tariffName = tariffJSON.tariffName;
	localStorage.lseName = tariffJSON.lseName;
	$(".tariff").html(tariffJSON.tariffName + " from " + tariffJSON.lseName);
	$(".provider").html();
	console.log("pricesUrl");
	console.log(pricesUrl);
	console.log("pricesJSON");
	console.log(pricesJSON);
	// detect current price of the consumption rate
	var currentPrice;
	var priceIndex;
	var currentTariff;
	var noConsumption = true;
	for(i=0;i<pricesJSON.results.length;i++){
		if(pricesJSON.results[i].chargeType == "CONSUMPTION_BASED"){
			currentTariff = pricesJSON.results[i];
			currentPrice = pricesJSON.results[i].rateAmount*100;
			priceIndex = pricesJSON.results[i].relativePriceIndex;
			i = pricesJSON.results.length;
			noConsumption = false;
		}
	}
	if (noConsumption) {
		currentTariff = pricesJSON.results[0];
		currentPrice = 0;
		priceIndex = pricesJSON.results[0].relativePriceIndex;
	}
	// setting chrome badge w/ price
	chrome.browserAction.setBadgeText({text:Math.round(currentPrice)+' '+String.fromCharCode(162)});
	if (tariffChargeTypes.toString() == "Fixed"){
		chrome.browserAction.setBadgeBackgroundColor({color:FIXED});
		$(".rate").html("<div class='rate_holder' style='background-color:"+FIXED_HEX+"'><span class='cents'>"+Math.round(currentPrice)+"&cent;</span></div>We estimate you are paying a consumption rate of "+currentPrice.toFixed(2)+"&cent;/kWh.");
	} else {
		chrome.browserAction.setBadgeBackgroundColor({color:getBadgeColor(priceIndex, false)});
		$(".rate").html("<div class='rate_holder' style='background-color:"+getBadgeColor(priceIndex, true)+"'><span class='cents'>"+Math.round(currentPrice)+"&cent;</span></div>We estimate you are paying a rate of "+currentPrice.toFixed(2)+"&cent;/kWh.");
	}
	// check for a price change and display it
	if(currentTariff.priceChanges[0]){
		// convert iso-8601 date to the hour of the time
		var nextTime = new Date(currentTariff.priceChanges[0].changeDateTime).getHours();
		// convert to standard time
		var standardTime = showTheHours(nextTime);
		var nextMonth = new Date(currentTariff.priceChanges[0].changeDateTime).getMonth()+1;
		var nextDate = new Date(currentTariff.priceChanges[0].changeDateTime).getDate();
		// flag any price increase
		var rateDelta;
		$(".next_rate").removeClass('increase').removeClass('none');
		var nextPrice = currentTariff.priceChanges[0].rateAmount*100
		if(currentPrice < nextPrice) {
			$(".next_rate").addClass('increase');
			rateDelta = "increase";
		} else {
			rateDelta = "decrease";
		}
		$(".next_rate").html("At "+standardTime+showAmPm(nextTime)+" on "+nextMonth+"/"+nextDate +" the rate will "+rateDelta+ " to "+nextPrice.toFixed(2)+"&cent;/kWh.");
	} else {
		$(".next_rate").addClass('none');
	}
}

function showTheHours(theHour) {
	if (theHour > 0 && theHour < 13) {
		if (theHour == "0") theHour = 12;
		return (theHour);
	}
	if (theHour == 0) {
		return (12);
	}
	return (theHour-12);
}

function showAmPm(nextTime) {
	if (nextTime < 12) {
		return ("am");
	}
	return ("pm");
}

function loadUpdatingModal(execute){
	if(execute == "start"){
		$(".options").hide();
		console.log("TIMER running.");
		imgArray = $("#animation img");
		reorderedArray = [imgArray[4], imgArray[0], imgArray[1], imgArray[2], imgArray[3]];
		$("#animation").html(reorderedArray);
		TIMER = setTimeout(function(){
            loadUpdatingModal("start");
        }, 500);
		$("#updating").fadeIn(FADE_IN_DURATION).show();
	}else{ 
		if ($("#choose_zip").css("display") == "block") {
			$(".options").hide();
		} else {
			$(".options").fadeIn(FADE_IN_DURATION).show();
		}
		console.log("timer stopping");
		clearTimeout(TIMER);
		$("#updating").hide();
	}
}

function loadErrorScreen(json){
	if($("#updating")){loadUpdatingModal("stop")};
	//$(".error_code").html("Error Code# "+json.statusCode);
	//$(".error_info").html(json.statusText);
	$(".error_code").html("There was an error processing your request. Please try again. If the problem persists, please contact us!");
$(".error_code").html(json);

	$("#error").fadeIn(FADE_IN_DURATION).show();
}

function getBadgeColor(relativePriceIndex, isHex) {
	if (isHex) {
		if (relativePriceIndex < 0.26) {
			return LOW_HEX;
		} else if (relativePriceIndex < 0.51) {
			return MID_HEX;
		} else if (relativePriceIndex < 0.76) {
			return HIGH_HEX;
		} else {
			return HIGHEST_HEX;
		}
	} else {
		if (relativePriceIndex < 0.26) {
			return LOW;
		} else if (relativePriceIndex < 0.51) {
			return MID;
		} else if (relativePriceIndex < 0.76) {
			return HIGH;
		} else {
			return HIGHEST;
		}
	}
}

function pad(number, length) { 
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }  
    return str;
}
