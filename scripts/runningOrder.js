// Running Order Functionality
// This file handles the running order view generation and management

$(document).ready(function() {
    // RUNNING ORDER
    $(document).on('click', '.runningOrder-button', function() { 
        const showScriptButton = $('<button class="btn button2" title="Show Script"><i class="fas fa-list-ol"></i> Show Script</button>');
        
        // Store the original content
        const originalContent = $('.container').html();
        
        // Store all input values before switching views
        const storedInputs = {
            itemContents: $('.item-content').map(function() {
                return $(this).val() || $(this).text();
            }).get(),
            insertInputs: $('.insertTitle, .insertIn, .insertOut').map(function() {
                return $(this).val() || $(this).text();
            }).get(),
            eventInputs: $('.cameraNum, .cameraPos, .shotSubject, .extraInfo, .shot-type-select').map(function() {
                return $(this).val() || $(this).text();
            }).get(),
            timeInputs: $('input[type="time"]').map(function() {
                return $(this).val();
            }).get()
        };

        // Event > Item numbers
        const eventNumbers = [];
        const itemNumbers = [];
        const sourceType = [];
        const soundSource = [];
        const itemLength = [];
        const accumulatedTime = [];
        const timeStore = [];
        const itemTitle = [];
        let accumulatedCalc = 0;

        // Calculate how long it would take for dialogue to be spoken
        function wordCalculation(content) { // Passes in the dialogue in the event
            const wordCount = content.trim().split(' ').length; // Get word count
            const wordsPerSecond = 2.5; // Average words per second
            const totalSeconds = wordCount * wordsPerSecond; 
            // Call the function to convert this to a time format
            return timeConvert(totalSeconds); 
        }

        function secondCalc(time) {
            const timeString = String(time).trim();
            const timeFormat = timeString.split(':');
            const minutes = parseInt(timeFormat[0], 10);
            const seconds = parseInt(timeFormat[1], 10);
            const totalSeconds = minutes * 60 + seconds;
            return totalSeconds;
        }

        // Convert time in seconds to '00:00' format for running order
        function timeConvert(time) {
            const totalSeconds = Math.round(time); // Round total seconds
            const minutes = Math.floor(totalSeconds / 60); // Convert seconds to minutes
            const seconds = totalSeconds % 60; // Get the remainder seconds
            // Return this in a '00:00' format
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        let currentItem = null;

        // Find all item rows and their indices
        const itemRows = [];
        // $('#event-table').find('tr.event_highlighted').each(function(index) {
        $('#event-table tbody tr').each(function(index) {
            if ($(this).hasClass('item_highlighted')) {
                itemRows.push({
                    index: index,
                    itemNumber: $(this).find('td:nth-child(3)').text().match(/ITEM\s+(\d+)/i)?.[1]
                });
            }
        });

        // Process rows between each pair of items
        for (let i = 0; i < itemRows.length; i++) {
            console.log('i', i);
            const currentItem = itemRows[i];
            console.log('currentItem', currentItem);
            const nextItem = itemRows[i + 1];
            const startIndex = currentItem.index + 1;
            const endIndex = nextItem ? nextItem.index : $('#event-table tbody tr').length;

            // Get the item title and push it into the list
            const itemContent = $('#event-table tbody tr').eq(currentItem.index)
                .find('.item-content')
                .map(function() {
                    // Try getting value first, then fall back to text content
                    return $(this).val() || $(this).text();
                })
                .get(0)
                .trim();
            itemTitle.push(itemContent);
            itemNumbers.push(currentItem.itemNumber);
            
            // Initialize total time for item
            let totalSeconds = 0;
            let hasVT = false;

            // Process rows between current item and next item 
            for (let j = startIndex; j < endIndex; j++) {
                const row = $('#event-table tbody tr').eq(j);
                const hasEvent = row.find('td:nth-child(2)').text().trim().length > 0;
                const hasInsert = row.find('input[type="time"]').length > 0;

                if (hasEvent) {
                    // Calculate timing based on word count for events
                    const scriptCell = row.find('td:nth-child(3)');
                    const content = scriptCell.clone()
                        .find('.cut-line').remove().end()
                        .text()
                        .trim();
                    
                    const wordCount = content ? content.split(' ').length : 0;
                    const wordsPerSecond = 2.5;
                    totalSeconds += wordCount * wordsPerSecond;
                } else if (hasInsert) {
                    hasVT = true;
                    // Add insert duration
                    const durationInput = row.find('input[type="time"]');
                    if (durationInput.length > 0 && durationInput.val()) {
                        const [minutes, seconds] = durationInput.val().split(':');
                        totalSeconds += parseInt(minutes) * 60 + parseInt(seconds);
                    }
                }
            }

            // Push all data for this item
            sourceType.push(hasVT ? "VT" : "CAMS");
            soundSource.push(hasVT ? "VT" : "");
            itemLength.push(timeConvert(totalSeconds));
        }

        function accumulatedTimeCalc() {
            for(let i = 0; i < itemLength.length; i++) {
                if(i == 0) {
                    accumulatedTime.push(timeConvert(secondCalc(itemLength[i])));
                } else {
                    accumulatedTime.push(timeConvert(secondCalc(itemLength[i]) + secondCalc(accumulatedTime[i-1])));
                }
            }
        }

        accumulatedTimeCalc();
        
        $('.container').html(`
            <head>
                <style>
                    /* Change styling of last header column in running order */
                    #runningOrder-table thead tr th:last-child {
                        /* better contrast for accessibility */
                        background-color: #2c3e50 !important;
                        color: #ffffff !important;
                        border-radius: 12px 12px 0 0;
                        
                        /* Text styling for better readability */
                        text-align: center !important;
                        vertical-align: middle !important;
                        height: 56px !important;
                        line-height: 150% !important;
                        font-weight: 700 !important;
                        text-transform: uppercase !important;
                        font-size: 16px !important;
                        letter-spacing: 0.7px !important;
                        border-bottom: 3px solid #34495e !important;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
                        padding: 12px 16px !important;
                    }
                </style>
            </head>
            <body>
                <table style="margin-top:100px; text-align:center;" id="runningOrder-table" class="table">
                    <thead>
                        <tr>
                            <th style="width:8%;">ITEM NUM.</th>
                            <th style="width:12%;">SOURCE</th>
                            <th style="width:40%;">CONTENT</th>
                            <th style="width:20%;">SOUND</th>
                            <th style="width:10%;">ITEM TIME</th>
                            <th style="width:10%;">ACC. TIME</th>
                            <th style="width:10%;">ACTUAL TIME</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemNumbers.map((num, index) => {
                            const stateItem = productionState.events.find(event => event.type === 'item' && event.itemNumber == num);
                            const actualTime = stateItem ? stateItem.actualTime : '';
                            return `
                            <tr>
                                <td contenteditable="false">${num}</td>
                                <td contenteditable="true">${sourceType[index]}</td>
                                <td contenteditable="true" style="text-align:left; margin-left: 50px;">${itemTitle[index]}</td>
                                <td contenteditable="true">${soundSource[index]}</td>
                                <td contenteditable="false">${itemLength[index]}</td>
                                <td contenteditable="false">${accumulatedTime[index]}</td>
                                <td contenteditable="true" class="actual-time-cell" data-item-number="${num}">${actualTime || ''}</td>
                            </tr>
                            `
                        }).join('')}
                    </tbody>
                </table>
            </body>
        `);

        // Remove any existing show script buttons first
        $('.toolbar-group .showScript-button').remove();
        
        // Remove the running order button
        $('.runningOrder-button').remove();
        
        // Attach click handler to show script button
        showScriptButton.on('click', function() {
            // Instead of restoring from stored inputs, rebuild the table from the current state
            // This ensures that any actualTime changes made in Running Order view are preserved
            $('.container').html(`
                \u003ctable style="margin-top:100px;" id="event-table" class="draggable-table"\u003e
                    \u003cthead\u003e
                        \u003ctr\u003e
                            \u003cth scope="col" style="border: 1px solid black; width:100px; text-align: center;"\u003eEvent number\u003c/th\u003e
                            \u003cth scope="col" style="border: 1px solid black; width:350px; text-align: center;"\u003eShot\u003c/th\u003e
                            \u003cth scope="col" style="border: 1px solid black; width:450px; text-align: center;"\u003eScript\u003c/th\u003e
                            \u003cth scope="col" style="border: 1px solid black; width:150px; text-align: center;"\u003eDetails\u003c/th\u003e
                            \u003cth scope="col" style="border: none; width:90px; text-align: center;"\u003e\u003c/th\u003e
                        \u003c/tr\u003e
                    \u003c/thead\u003e
                    \u003ctbody\u003e
                    \u003c/tbody\u003e
                \u003c/table\u003e
            `);
            
            // Rebuild the table from the current production state
            // This will include all the actualTime values and other changes
            if (typeof rebuildTableFromState === 'function') {
                rebuildTableFromState();
            } else {
                console.error('rebuildTableFromState function not available');
            }

            $(this).remove();
            const runningOrderButton = $('\u003cbutton class="btn button2 runningOrder-button" title="Running Order"\u003e\u003ci class="fas fa-list-ol"\u003e\u003c/i\u003e Running Order\u003c/button\u003e');
            $('.toolbar-group.dynamic-buttons').append(runningOrderButton);
        });

        // Add the show script button
        $('.toolbar-group.dynamic-buttons').append(showScriptButton);

        // Add event listener for the actual time cells
        $(document).on('blur', '.actual-time-cell', function() {
            const itemNumber = $(this).data('item-number');
            const actualTime = $(this).text();
            const itemInState = productionState.events.find(event => event.type === 'item' && event.itemNumber == itemNumber);
            if (itemInState) {
                itemInState.actualTime = actualTime;
                sessionStorage.setItem('productionState', JSON.stringify(productionState));
            }
        });
    });
}); 