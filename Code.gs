function onHomepage(e) {  
  const cardHeader = CardService.newCardHeader()
    .setTitle("Welcome to Squidy!")
    .setImageUrl("https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/71/squid_1f991.png");
  
  const aboutSquidy = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText('Squidy allows you to take personal notes for your calendar events.'))
    .addWidget(CardService.newImage()
      .setAltText("unDraw Notebooks")
      .setImageUrl("https://i.imgur.com/uIPCbKD.png"));

  const aboutSquidy2 = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText('You can also send emails from your event notes!'))
      .addWidget(CardService.newImage()
      .setAltText("unDraw Notebooks")
      .setImageUrl("https://i.imgur.com/Qlh30ga.png"));
 
  const aboutSquidy3 = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText('Go on! Click on an event to get started with Squidy!'))
      .addWidget(CardService.newImage()
      .setAltText("unDraw Notebooks")
      .setImageUrl("https://i.imgur.com/4KdnrAF.png"));

  const gitHubButton = CardService.newTextButton()
    .setText('GitHub')
    .setOpenLink(CardService.newOpenLink()
        .setUrl("https://github.com/duchess-toffee"));

  
  const fixedFooter = CardService.newFixedFooter()
    .setPrimaryButton(gitHubButton)
                        
  return card = CardService.newCardBuilder()
    .setHeader(cardHeader)
    .addSection(aboutSquidy)
    .addSection(aboutSquidy2)
    .addSection(aboutSquidy3)
    .setFixedFooter(fixedFooter)
    .build();
  
}


function onEventOpen(event) {
  const eventId = event.calendar.id;
  const eventNotes = getNotes(eventId)
  
  return renderEventUI(eventId, eventNotes, event);
}


function renderEventUI(eventId, eventNotes, event) {
  const hasEventTitle = CalendarApp.getEventById(eventId) == null ? 'New Event' : CalendarApp.getEventById(eventId).getTitle();
  const hasEventNotes = eventNotes !== null ? eventNotes : ''
  
  let card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(hasEventTitle))
  
  const notesContent = CardService.newTextInput()
    .setFieldName("event_notes")
    .setTitle("Notes")
    .setValue(hasEventNotes)
    .setMultiline(true);
  
  const saveButton = CardService.newTextButton()
    .setText('Save')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('saveNotes')
        .setParameters({eventId: eventId.toString()}));
  
  const createEmailButton = CardService.newTextButton()
    .setText('Create Email')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('renderEmailUI')
        .setParameters({eventId: eventId.toString(), hasEventTitle, hasEventNotes}));
  
  const fixedFooter = CardService.newFixedFooter()
    .setPrimaryButton(saveButton)
    .setSecondaryButton(createEmailButton)
  
  card
    .addSection(CardService.newCardSection()
      .addWidget(notesContent))
    .setFixedFooter(fixedFooter)
 
  return card.build();
}

                        
function getNotes(eventId){
  const notesCache = PropertiesService.getUserProperties();
  let eventNotes = notesCache.getProperty(eventId);
  return eventNotes;
}

                        
function saveNotes(event){
  const {eventId} = event.parameters;
  let notesCache = PropertiesService.getUserProperties();
  
  notesCache.setProperty(eventId, event.formInputs.event_notes[0]);
}                     

                        
function renderEmailUI(event) {
  const {eventId, hasEventTitle, hasEventNotes} = event.parameters;
  console.log(event.calendar.hasOwnProperty('attendees'))
                        
  let eventAttendees = [];
  if (event.calendar.hasOwnProperty('attendees')) {
    event.calendar.attendees.forEach((attendee, index) =>  eventAttendees.push(attendee.email))
  }
  const hasEventAttendees = eventAttendees.length > 0 ? eventAttendees.toString() : '';
  const hasEventContent = event.formInput.hasOwnProperty('event_notes') ? event.formInput.event_notes : '';
                        
  const emailRecipients = CardService.newTextInput()
    .setFieldName('email_recipients')
    .setTitle('Recipients')
    .setValue(hasEventAttendees);
  const emailSubject = CardService.newTextInput()
    .setFieldName('email_subject')
    .setTitle('Subject')
    .setValue(hasEventTitle);
  const emailContent = CardService.newTextInput()
    .setFieldName('email_content')
    .setTitle('Email Content')
    .setValue(hasEventContent)
    .setMultiline(true);
                        
  const draftButton = CardService.newTextButton()
    .setText('Save as Draft')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('sendDraft'));
  
  const emailButton = CardService.newTextButton()
    .setText('Send Email')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('sendEmail'));
  
  const fixedFooter = CardService.newFixedFooter()
    .setPrimaryButton(emailButton)
    .setSecondaryButton(draftButton)
                        

  const emailCard = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle(hasEventTitle))
    .addSection(CardService.newCardSection()
      .addWidget(emailRecipients)
      .addWidget(emailSubject)
      .addWidget(emailContent))
    .setFixedFooter(fixedFooter)
      .build();

  const nav = CardService.newNavigation().pushCard(emailCard);
  return CardService.newActionResponseBuilder()
      .setNavigation(nav)
      .build();
}
                        
                       
function sendDraft(event){
  GmailApp.createDraft(event.formInput.email_recipients, event.formInput.email_subject , event.formInput.email_content);
}
                                                
function sendEmail(event){
  GmailApp.sendEmail(event.formInput.email_recipients, event.formInput.email_subject , event.formInput.email_content);
}