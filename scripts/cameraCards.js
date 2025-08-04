// Camera Cards Functionality
// This file handles camera card generation and management

$(document).ready(function() {
    // CAMERA CARD DROPDOWN
    $('.camCard-button').on('click', function() {
        let camList = []; // stores list of unique cameras
        let camCards = []; // Stores all info for events

        $('#event-table').find('tr.event_highlighted').each(function() {
            const row = $(this);
            
            const eventNum = row.find('td:first-child').text() || '';
            const shotCell = row.find('td:nth-child(2)');

            const cameraNum = shotCell.find('.cameraNum').val() || '';
            const cameraPos = shotCell.find('.cameraPos').val() || '';
            const shotType = shotCell.find('.shot-type-select').val() || '';
            const shotSubject = shotCell.find('.shotSubject').val() || '';
            const info = shotCell.find('.extraInfo').val() || '';

            // Adds events to the camera array as objects
            let event = {
                eventNumber: eventNum,
                cameraNumber: cameraNum,
                cameraPosition: cameraPos,
                shotType: shotType,
                shotSubject: shotSubject,
                extraInfo: info
            };  
            camCards.push(event);
        });
        
        // Get a list of cameras, ignoring duplicate mentions
        for(let i = 0; i < camCards.length; i++) {
            let alreadyAdded = false;
            let tempCamNum = camCards[i].cameraNumber; // Store current cam number

            if(tempCamNum && !(camList.includes(tempCamNum))) {
                camList.push(tempCamNum);
            }
        }
        
        // Populates the dropdown menu with the available camera options
        const dropdown = $('#camera-options');
        dropdown.empty(); // Clear existing options
        
        if (camList.length === 0) {
            dropdown.append('<div>No cameras found</div>');
        } else {
            camList.forEach((camera) => {
                const cameraOption = $(`<div><button class="btn button3 createCamCard-button" id="${camera}" title="camOption"> CAMERA ${camera}</button></div>`);
                dropdown.append(cameraOption);
            });
        }
    });

    // CREATE CAMERA CARD
    $(document).on('click', '.createCamCard-button', function() {
        let cameraNumber = (this.id);
        let camCards = [];

        $('#event-table').find('tr.event_highlighted').each(function() {
            const row = $(this);
            
            const eventNum = row.find('td:first-child').text() || '';
            const shotCell = row.find('td:nth-child(2)');
            

            const cameraNum = shotCell.find('.cameraNum').val() || '';
            const cameraPos = shotCell.find('.cameraPos').val() || '';
            let shotType = shotCell.find('.shot-type-select').val() || '';
            const shotSubject = shotCell.find('.shotSubject').val() || '';
            const info = shotCell.find('.extraInfo').val() || '';

            if(shotType === "SHOT TYPE") {
                shotType = '';
            }
            // Adds events to the camera array as objects
            let event = {
                eventNumber: eventNum,
                cameraNumber: cameraNum,
                cameraPosition: cameraPos,
                shotType: shotType,
                shotSubject: shotSubject,
                extraInfo: info
            };  
            camCards.push(event);
        });

        // Filter events for the selected camera
        const currentCameraEvents = camCards.filter(event => event.cameraNumber === cameraNumber);

        // Create new window and display camera card for the selected camera
        const camCardWindow = window.open('', '_blank');
        camCardWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Camera Card: Camera ${cameraNumber}</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
                    <style>
                        body { padding: 20px; }
                        table { width: 794px; margin: 0 auto; }
                        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h2 style="margin-left: 420px;">Camera ${cameraNumber}</h2>
                    <div class="container">
                        <table id="camCard-table" style="align: center;">
                            <thead>
                                <tr>
                                    <th scope="col" style="width:15%; text-align: center;">Shot</th>
                                    <th scope="col" style="width:15%; text-align: center;">Position</th>
                                    <th scope="col" style="width:50%; text-align: center;">Description</th>
                                    <th scope="col" style="width:20%; text-align: center;">Notes</th>   
                                </tr>
                            </thead>
                            <tbody>
                                ${currentCameraEvents.map(event => `
                                    <tr>
                                        <td style="text-align: center;">${event.eventNumber}</td>
                                        <td style="text-align: center;">${event.cameraPosition}</td>
                                        <td style="text-align: left;">${event.shotType} ${event.shotSubject}</td>
                                        <td contenteditable="true">${event.extraInfo}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
        `);
        camCardWindow.document.close();
    });
}); 