// api global variables
var API_ROOT_URL = "http://api.genability.com/rest/public/";
var TARIFFS_API = "tariffs";
var TERRITORY_API = "territories";
var LSES_API = "lses";
var PRICES_API = "prices";
var SEASONS_API = "seasons";
var API_AUTH_STRING = "?appId=[YOUR_API_ID]&appKey=[YOUR_API_KEY]"; // https://developer.genability.com/signup

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
var currMonth = currDate.getMonth() + 1;
console.log(currDate);

// timer vars for loading animation
var TIMER;
var TIMER_IS_ON = 0;

// animation durations
var FADE_IN_DURATION = 400;

$(document).ready(function(){	
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
		loadTariffs();
	});
});

// load the plans for the zipcode
function loadTariffs(json){
	$('#options').show();
	$(".options").hide();
	$("#error").hide();
	$("#widget").hide();
	// build zip_code form
	var zip_form = $("<form/>").attr("id", "choose_zip").attr("action", API_ROOT_URL+TARIFFS_API).appendTo("#options.page");
	var zip_label = $("<label/>").attr("for", "zip_code").attr("class", "zcode").html("ZIP Code").appendTo(zip_form);
	var zip_input = $("<input/>").attr("id", "zip_code").attr("name", "zip_code").attr("class", "text_input").appendTo(zip_form);
	$("<input/>").attr("type", "submit").attr("class", "save").attr("value", "SAVE").appendTo(zip_form);
	// load zipCode if stored in local Storage
	$("#zip_code").val(localStorage.zipCode);
	$("<br/>").appendTo(zip_form);
	
	// build plans form
	var plan_form = $("<form/>").attr("id", "rate_plans").appendTo("#options.page");
	var rate_plan = $("<p/>").attr("class", "rate_plan").html("Rate Plan ").appendTo(plan_form).hide();
	var plans_div = $("<div/>").attr("id", "plans").appendTo(plan_form);
	
	// if json object is valid build the input fields for the plans
	if(json){
		console.log("Logging tariffs");
		var plans = $.each(json.results, function(i,result){
			var planHolder = $("<span/>").attr("class", "planHolder");
			var chkId = 'chk' + i;
	      	$("<input/>").attr("class", "plan").attr("type", "radio").attr("name", "tarriffNames").attr("idx", i).attr("value", result.masterTariffId).appendTo(planHolder).attr("id", chkId);
			$("<label/>").addClass("radio_txt").attr("for", chkId).html(result.tariffName).appendTo(planHolder);
			$("<br/>").appendTo(planHolder);
			$("<span/>").addClass("lseName").html(result.lseName).appendTo(planHolder);
			planHolder.appendTo(plans_div);
			rate_plan.show();
			console.log(result);
	    });
		var div = $("<div/>").attr("id", "buttons").appendTo(plans_div);
		$("<a/>").attr("class", "btn").attr("id", "cancel").html("<span>CANCEL</span>").appendTo(div);
		$("<input/>").attr("type", "submit").attr("value", "SUBMIT").appendTo(div);
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

			var retrievedObject = localStorage.tariff;
			var encoded = JSON.parse(String(retrievedObject));
			var url = API_ROOT_URL+TERRITORY_API+API_AUTH_STRING+"&masterTariffId="+encoded.masterTariffId+"&containsItemType=ZIPCODE&containsItemValue="+localStorage.zipCode;
			console.log("url: "+url);
			var jqxhr = $.getJSON(url, function(json) {
			})
			.success(function(territoryJSON) { 
				localStorage.territoryId = territoryJSON.results[0].territoryId;
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

	// attach a submit handler to the zip_code form	
	$("#choose_zip").submit(function(event) {
		plan_form.remove();
		$("#choose_zip input[type=submit]").attr('disabled','disabled');
		// stop form from submitting normally
		event.preventDefault(); 
		// get some values from elements on the page:
		var $form = $(this),
			term = $form.find('input[name="zip_code"]').val(),
			url = $form.attr('action');
		url = url+API_AUTH_STRING+"&zipCode="+term;

		localStorage.zipCode = term;
		// start loading animation
		loadUpdatingModal("start");
		// Assign handlers immediately after making the request, and remember the jqxhr object for this request
		var jqxhr = $.getJSON(url, function(json) {
			//console.log(json);
		})
		.success(function(json) { 
			plan_form.remove();
			zip_form.remove();
			localStorage.tariffs = json;
			console.log("json object being passed to loadTariffs();");
			console.log(json);			
			loadTariffs(json);
		})
		.error(function(json) {
			loadErrorScreen(json); 
			console.log("ERROR:choose_zip:");
			console.log(json);
		}).complete(function(json) {
			loadUpdatingModal("stop");
			$("#choose_zip input[type=submit]").removeAttr('disabled');
		});
	});
	
	// attach a submit handler to the plans form	
	$("#rate_plans").submit(function(event) {
		// stop form from submitting normally
		event.preventDefault(); 
		// get some values from elements on the page:
		var $form = $(this),
			chosen_plan = $form.find('input:checked').val();
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
	});
	
	// setup cancel button functionality
	$('#cancel').click(function() {
		self.close();
	});
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

function loadWidgetData(tariffJSON) {
	// ajax call for price
	var currentTime = currDate.getFullYear() + "-" + currDate.getMonth() + "-" + currDate.getDate() + " " + currDate.toLocaleTimeString();
	var pricesUrl = API_ROOT_URL+PRICES_API+"/"+tariffJSON.masterTariffId+API_AUTH_STRING+"&fromDateTime="+currentTime+"&territoryId="+localStorage.territoryId+"&consumptionAmount="+localStorage.monthlyConsumption;
	var jqxhr = $.getJSON(pricesUrl, function(json) {
	})
	.success(function(pricesJSON) {
		loadUpdatingModal("stop");
		if($("#widget")){$("#widget").fadeIn(FADE_IN_DURATION).show()};
		$("inner_wrapper").text(pricesUrl);
		$("#widget p").html("");
		$("#widget .details").html("");
		console.log(tariffJSON);
		$(".territory").html('ZIP Code '+localStorage.zipCode);
		// Check for charge types and write them to the details list
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
		var detailsUl = $(".details");
		if(tariffChargeTypes.length > 0){
			$("<li/>").html("This plan has " +tariffChargeTypes.toString()+ " charges.").appendTo(detailsUl);
		}
		$("<li/>").html('<a href="http://whatsmypower.com/locations/'+localStorage.zipCode+'/rates/'+tariffJSON.tariffId+'" title="whatsmypower.com" target="_blank">Your electricity plan details.</a>').appendTo(detailsUl);
		$(".tariff").html(tariffJSON.tariffName + " from " + tariffJSON.lseName);
		$(".provider").html();
		console.log("pricesUrl");
		console.log(pricesUrl);
		console.log("pricesJSON");
		console.log(pricesJSON);
		var currentPrice = Math.round(pricesJSON.results[0].rateAmount); 
		// setting chrome badge w/ price
		chrome.browserAction.setBadgeText({text:currentPrice+' '+String.fromCharCode(162)});
		chrome.browserAction.setBadgeBackgroundColor({color:[255,165,0,255]});
		$(".rate").html("<div class='rate_holder'><span class='cents'>"+currentPrice+"&cent;</span></div>We estimate you are paying a rate of "+pricesJSON.results[0].rateAmount+"&cent;/kWh.");
		// check for a price change and display it
		if(pricesJSON.results[0].priceChanges[0]){
			// convert iso-8601 date to the hour of the time
			var nextTime = new Date(pricesJSON.results[0].priceChanges[0].changeDateTime).getHours();
			// convert to standard time
			var standardTime = showTheHours(nextTime);
			// flag any price increase
			var rateDelta;
			$(".next_rate").removeClass('increase').removeClass('none');
			if(currentPrice < pricesJSON.results[0].priceChanges[0].rateAmount) {
				$(".next_rate").addClass('increase');
				rateDelta = "increase";
			} else {
				rateDelta = "decrease";
			}
			$(".next_rate").html("At "+standardTime+showAmPm(nextTime)+" the electricity will "+rateDelta+ " to a rate of "+pricesJSON.results[0].priceChanges[0].rateAmount+"&cent;/kWh.");
		} else {
			$(".next_rate").addClass('none');
		}
	})
	.error(function(json) {
		loadErrorScreen(json);
		//$("#inner_wrapper").text(pricesUrl);
		console.log("ERROR:loadWidgetData:priceUrl:");
		console.log(json);
		console.log("pricesUrl");
		console.log(pricesUrl);
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
		$(".options").fadeIn(FADE_IN_DURATION).show();
		console.log("timer stopping");
		clearTimeout(TIMER);
		$("#updating").hide();
	}
}

function loadErrorScreen(json){
	if($("#updating")){loadUpdatingModal("stop")};
	$(".error_code").html("Error Code# "+json.statusCode);
	$(".error_info").html(json.statusText);
	$("#error").fadeIn(FADE_IN_DURATION).show();
}
