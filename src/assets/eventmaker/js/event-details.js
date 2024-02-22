eventComboApp.controller('eventDetailsController', ['$scope', eventDetailsCtrlFunction]);
function eventDetailsCtrlFunction($scope) {
  // init
  $scope.category = 1;
  $scope.scheduleTabs = 1;
  
  // SCHEDULE TABS
  $scope.scheduleTabsFunc = function(tab){
    $scope.scheduleTabs = tab;
  }

  // CATEGORIES
  $scope.categories = [
    { id: 1, name: 'Overview', icon: 'Images/howitsworks/categories/overview.svg' },
    { id: 2, name: 'Free Events', icon: 'Images/howitsworks/categories/free-events.svg' },
    { id: 3, name: 'Festivals', icon: 'Images/howitsworks/categories/festivals.svg' },
    { id: 4, name: 'Parties', icon: 'Images/howitsworks/categories/parties.svg' },
    { id: 5, name: 'Concerts', icon: 'Images/howitsworks/categories/concerts.svg' },
    { id: 6, name: 'Performance', icon: 'Images/howitsworks/categories/performance.svg' },
    { id: 7, name: 'Fundraisers', icon: 'Images/howitsworks/categories/fundraisers.svg' },
    { id: 8, name: 'Conferences', icon: 'Images/howitsworks/categories/conferences.svg' },
    { id: 9, name: 'Sports', icon: 'Images/howitsworks/categories/sports.svg' },
    { id: 10, name: 'Politics', icon: 'Images/howitsworks/categories/politics.svg' },
    { id: 11, name: 'Classes', icon: 'Images/howitsworks/categories/classes.svg' },
  ] 
  
  // EVENT SPEAKERS 
  $scope.speakerData = [
    { id: 1, imgSrc: 'https://i.ibb.co/znbWkX8/ec1.jpg', name: 'Randy Boyd', title : 'Founder & CEO, Trowey ', shortDiscription : 'Donec aliquet quam purus. Fusce hendrerit, massa vitae porta vehicula, velit mauris faucibus felis, ac ligula enim quis nisl. Maecenas eu efficitur dui. Nulla placerat, quam efficitur varius finibus, urna lacus molestie odio, a tempus leo lacus at odio. Sed quam tellus, viverra nec rutrum a, porta commodo' },
    { id: 2, imgSrc: 'https://i.ibb.co/pwnS2w7/ec2.jpg', name: 'Kelly Williamson', title : 'Partnerships, SaaS Insider', shortDiscription : 'Donec aliquet quam purus. Fusce hendrerit, massa vitae porta vehicula, velit mauris faucibus felis, ac ligula enim quis nisl. Maecenas eu efficitur dui. Nulla placerat, quam efficitur varius finibus, urna lacus molestie odio, a tempus leo lacus at odio. Sed quam tellus, viverra nec rutrum a, porta commodo' },
    { id: 3, imgSrc: 'https://i.ibb.co/cQtPtZm/ec3.jpg', name: 'Carol Wallace', title : 'Co-Founder, BoeYrw', shortDiscription : 'Donec aliquet quam purus. Fusce hendrerit, massa vitae porta vehicula, velit mauris faucibus felis, ac ligula enim quis nisl. Maecenas eu efficitur dui. Nulla placerat, quam efficitur varius finibus, urna lacus molestie odio, a tempus leo lacus at odio. Sed quam tellus, viverra nec rutrum a, porta commodo' },
    { id: 4, imgSrc: 'Images/page3/team1.png', name: 'Tom Watkins', title : 'Senior Product Manager, Urpo', shortDiscription : 'Donec aliquet quam purus. Fusce hendrerit, massa vitae porta vehicula, velit mauris faucibus felis, ac ligula enim quis nisl. Maecenas eu efficitur dui. Nulla placerat, quam efficitur varius finibus, urna lacus molestie odio, a tempus leo lacus at odio. Sed quam tellus, viverra nec rutrum a, porta commodo' },
    { id: 5, imgSrc: 'Images/page3/team2.png', name: 'Randy Boyd', title : 'Founder & CEO, Trowey ', shortDiscription : 'Donec aliquet quam purus. Fusce hendrerit, massa vitae porta vehicula, velit mauris faucibus felis, ac ligula enim quis nisl. Maecenas eu efficitur dui. Nulla placerat, quam efficitur varius finibus, urna lacus molestie odio, a tempus leo lacus at odio. Sed quam tellus, viverra nec rutrum a, porta commodo' },
    { id: 6, imgSrc: 'Images/page3/team3.png', name: 'Kelly Williamson', title : 'Partnerships, SaaS Insider', shortDiscription : 'Donec aliquet quam purus. Fusce hendrerit, massa vitae porta vehicula, velit mauris faucibus felis, ac ligula enim quis nisl. Maecenas eu efficitur dui. Nulla placerat, quam efficitur varius finibus, urna lacus molestie odio, a tempus leo lacus at odio. Sed quam tellus, viverra nec rutrum a, porta commodo' },
    { id: 7, imgSrc: 'Images/page3/team4.png', name: 'Carol Wallace', title : 'Co-Founder, BoeYrw', shortDiscription : 'Donec aliquet quam purus. Fusce hendrerit, massa vitae porta vehicula, velit mauris faucibus felis, ac ligula enim quis nisl. Maecenas eu efficitur dui. Nulla placerat, quam efficitur varius finibus, urna lacus molestie odio, a tempus leo lacus at odio. Sed quam tellus, viverra nec rutrum a, porta commodo' },
    { id: 8, imgSrc: 'https://i.ibb.co/znbWkX8/ec1.jpg', name: 'Tom Watkins', title : 'Senior Product Manager, Urpo', shortDiscription : 'Donec aliquet quam purus. Fusce hendrerit, massa vitae porta vehicula, velit mauris faucibus felis, ac ligula enim quis nisl. Maecenas eu efficitur dui. Nulla placerat, quam efficitur varius finibus, urna lacus molestie odio, a tempus leo lacus at odio. Sed quam tellus, viverra nec rutrum a, porta commodo' }
  ]
  
  // TICKETS
  $scope.ticketData = [
    { id: 1, eventName: 'The DL NYC General Admission (FEMALE)', codeStatus: false, price : '$10', totalPrice : '$20' },
    { id: 2, eventName: 'The DL NYC General Admission (FEMALE)', codeStatus: false, price : '$10', totalPrice : '$20' },
    { id: 3, eventName: 'The DL NYC General Admission (FEMALE)', codeStatus: true, price : '$10', totalPrice : '$20' }
  ] 

  // SCHEDULE
  $scope.eventScheduleData = [
    { id: 1, time: '9:00 AM', title: 'Nullam est massa, rhoncus bibendum consectetur vel'},
    { id: 2, time: '10:00 AM', title: 'Vivamus ut libero consectetur, aliquam dolor ut'},
    { id: 3, time: '11:00 AM', title: 'Suspendisse sit amet massa quis felis euismod vulputate'},
    { id: 4, time: '12:40 PM', title: 'Maecenas facilisis ultricies aliquet'},
    { id: 5, time: '2:00 PM', title: 'Sed eu metus sed libero interdum commodo ut nec nisi'},
  ] 
  
  // FAQ
  $scope.faqData = [
    { id: 1, title: 'Which Payment methods do you accept?', content: 'Nullam est massa, rhoncus bibendum consectetur vel, feugiat non orci. Etiam est ligula, semper non accumsan in, fringilla a dui. Donec at lacinia urna. Donec mollis, nibh at sollicitudin feugiat, ante augue consequat ipsum, eu condimentum felis sapien in velit. Suspendisse consectetur consequat lacus, vitae sagittis diam porta vitae. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    { id: 2, title: 'What type of features and support do you offer?', content: 'Live virtual streaming allows you to stream presenters or attendees in real time. You may also livestream a pre-recorded video broadcast.' },
    { id: 3, title: 'How can I update or cancel my personal informations?', content: 'Live virtual streaming allows you to stream presenters or attendees in real time. You may also livestream a pre-recorded video broadcast.' },
    { id: 4, title: 'Where is the location of conference center?', content: 'Live virtual streaming allows you to stream presenters or attendees in real time. You may also livestream a pre-recorded video broadcast. Our unique layout with the industry-first, only platform providing the Fireworks Pallette elevates the attendee experience.' }
  ]

  // FEATURED BLOGS
  $scope.featuredBlogs = [
    { id: 1, title: 'Event Tech Innovator, Disruptor, and Leader to Watch: David Adler' },
    { id: 2, title: 'Top Event Planners You Need to Follow : Strategists, Producers, Designers, and More!' },
    { id: 3, title: 'How Private Labeling Can Add Strategic Value to Your Event: 3 Crucial Advantages' },
    { id: 4, title: 'How To Amplify Your Next Speaking Engagement: “3  Tips to Hit Your Speech Out of the Park” ' },
    { id: 5, title: 'EventTech Innovator, Disruptor, and Leader: Stewart Butterfield ' },
  ] 

  $( document ).scroll(function() {
    let x = $( this ).scrollTop();
    let pos = $('.eventSpeakers').offset().top;
    let pos2 = $('.eventTickets').offset().top;
    console.log("pos", pos2);
    if(x > 100){
      $('header').removeClass('noBG');
    }else {
      $('header').addClass('noBG');
    }
    if(x < pos || x > pos2){
      $('.getTicketSticky').removeClass('show');
    }else {
      $('.getTicketSticky').addClass('show');
    }
  });

  // SMOOTH SCROLL ON ANCHOR CLICK
  $(document).on('click', '#getTicketBtn', function (event) {
    event.preventDefault();
    $('html, body').animate({
        scrollTop: $($.attr(this, 'href')).offset().top - 80
    }, 800);
  });
}