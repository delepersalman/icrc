eventComboApp.controller('eventiconController', ['$scope', '$mdDialog', eventiconCtrlFunction]);
function eventiconCtrlFunction($scope, $mdDialog) {
  // init
  $scope.countryCode = 1;
  $scope.checkoutPageStatus = false;
  $scope.paymentMethod = 1;
  $scope.saveCardInfo = true;
  $scope.iAgreeTerms = true;
  $scope.orderPaymentProcess = true;
  $scope.orderSuccess = false;
  $scope.addAttendeeInfoToggle = true;
 
  $scope.phoneNumExtentions = 1;
  $scope.ticketPaymentphoneNumExtentions = 1; 

  $scope.stepper = {
    step1: Boolean = true,
    step2: Boolean = false,
    step3: Boolean = false,
    step4: Boolean = false,
    step5: Boolean = false
  };

  $scope.gotoStep1 = function(){
    $scope.stepper.step1 = true;
    $scope.stepper.step2 = false;
    $scope.stepper.step3 = false;
    $scope.stepper.step4 = false;
    $scope.stepper.step5 = false;
  }

  $scope.gotoStep2 = function(){
    $scope.stepper.step1 = false;
    $scope.stepper.step2 = true;
    $scope.stepper.step3 = false;
    $scope.stepper.step4 = false;
    $scope.stepper.step5 = false;
  }

  $scope.gotoStep3 = function(){
    $scope.stepper.step1 = false;
    $scope.stepper.step2 = false;
    $scope.stepper.step3 = true;
    $scope.stepper.step4 = false;
    $scope.stepper.step5 = false;
  }
  $scope.gotoStep4 = function(){
    $scope.stepper.step1 = false;
    $scope.stepper.step2 = false;
    $scope.stepper.step3 = false;
    $scope.stepper.step4 = true;
    $scope.stepper.step5 = false;
  }
  $scope.gotoStep5 = function(){
    $scope.stepper.step1 = false;
    $scope.stepper.step2 = false;
    $scope.stepper.step3 = false;
    $scope.stepper.step4 = false;
    $scope.stepper.step5 = true;
  }

 
   $scope.contactUs = function (event) {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', DialogContactUsController],
      templateUrl: 'contact-us.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  $scope.joinOurTeam = function (event) {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', DialogJoinOurTeamController],
      templateUrl: 'join-our-team.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  $scope.videoModal = function (event) {
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', DialogVideoContentController],
      templateUrl: 'video-content.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: event,
      scope: $scope,
      preserveScope: true,
      clickOutsideToClose: true
    })
  }

  $scope.placeorder = function(){
    $scope.orderPaymentProcess = false;
    $scope.orderSuccess = true;
  }

}

function checkScroll() {
  let x = $(this).scrollTop();
  if (x > 100) {
    $('header').removeClass('noBG');
  } else {
    $('header').addClass('noBG');
  }
}
$(document).ready(function () {
  checkScroll();
});

$(document).scroll(function () {
  checkScroll();
});


function DialogContactUsController($scope, $mdDialog) {
  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
}

function DialogVideoContentController($scope, $mdDialog) {
  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
}

function DialogJoinOurTeamController($scope, $mdDialog) {
  $scope.hide = function () {
    $mdDialog.hide();
  };

  $scope.cancel = function () {
    $mdDialog.cancel();
  };
}

