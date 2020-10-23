//Helper Functions
const n = (number, hand) => hand[number].value;
const c = (number, hand) => hand[number].color;

function evaluateCards(cards)
{
    let maxRank = evaluateSpecificHand(cards.slice(2));
    
    //Loop through possible hands
    for(let i = -1; i < 5; i++)
        for(let j = -1; j < 5; j++)
        {
            //Cannot replace bank card twice
            if(i == j)
                continue;

            let tokens = [...cards];

            //Replace bank cards
            if(i < 0)
                tokens.splice(0, 1);
            else
                tokens.splice(i + 2, 1);
            
            if(j < 0)
                tokens.splice(1, 1);
            else
                tokens.splice(j + 2, 1)

            let r = evaluateSpecificHand(tokens);
            if(r > maxRank)
                maxRank = r;
        }

    return maxRank;
}

function evaluateSpecificHand(hand)
{
    //Hand identifier explanation:
    // 1 Byte Number:
    // 4 MSB: Describe Hand State (0: High Card - 8: Straight Flush)
    // 4 following: Describe State Identifier via Most significant Card (0: Card Value 2 - 12: Card Value Ace)
    // 4 following: Describe State Identifier via Second most significant Card
    // Hand Identifier ranges from 0b00000000 (Theoretically Highest Card Two) to 0b10011101 (Straight Flush with Ace -> Royal Flush)
    // If a given Hand h1 is better than another h2, h1 > h2 always yields true.
    let identifier = n(0, hand);
    
    //Hyper params for hand evaluation
    let sCol = c(0, hand);
    let lP1 = -1;
    let lP2 = -1;
    let over  = -1

    //Y-Method
    let y = 0;
    let org = identifier;

    let m1 = -1;
    let m2 = -1;

    let min = identifier;
    
    //Possible 9 hand states are one by one excluded by masking a 9 bit number.
    let validStates = 511;
    
    //Look at hand card by card
    for(let i = 1; i < 5; i++)
    {
        //Look at next card
        let open = n(i, hand)

        //Check color
        if(c(i, hand) != sCol)
            validStates &= 0b011011111;

        //Check minimum
        if(open < min)
            min = open;

        //Update y-State
        y += (org == open) ? 1 : -1;

        //Handle equivalence
        if(open == identifier || open == lP1 || open == lP2 || open == over){
            validStates &= 0b011001110;
            
            //Set multiple
            if(m1 == -1)
                m1 = open;
            else if (open < m1)
                m2 = open;
            else if (open > m1)
            {
                m2 = m1;
                m1 = open;
            }
        }
        else
        {
            //Update State Identifier
            over = lP2;
            if(open > identifier)
            {
                lP2 = lP1;
                lP1 = identifier;
                identifier = open;
            }
            else if (open > lP1)
            {
                lP2 = lP1;
                lP1 = open;
            }
            else if(open > lP2)
            {
                lP2 = open;
            }
            else 
            {
                over = open;
            }

            //4 or more different cards
            if(over != -1)
            {
                validStates &= 0b100100011;
            }
        }
    }

    //Continue excluding
    if(lP2 == -1)
        validStates &= 0b011000000;
    else if(over == -1) 
        validStates &= 0b000001100;

    //Evaluate y-State
    if(y == 0 || y == -2)
        validStates &= 0b101111111;
    else if(y == 2 || y == -4)
        validStates &= 0b110111111;

    //Check for 2PT uncertainty
    if(m2 == -1)
        validStates &= 0b111111011;
    else
        validStates &= 0b111110111;

    //Check for range / High card
    console.log("Range is: " + min + " to: " + identifier)
    if(m1 == -1 && identifier - min == 4)
        validStates &= 0b100100000;   
    else if (m1 == -1)
        validStates &= 0b000100001;

    //Generate Hand Identifier

    console.log("Valid State: " + validStates);

    let h = 0;
    for(h = 8; h >= 0; h--)
        if((validStates & (1 << h)) != 0)
        break;

    console.log("Hand State: " + h);

    //Get Most Siginficant Card
    if(m1 == -1)
        m1 = identifier;
    if(m2 == -1)
        m2 = (m1 == -1) ? lP1 : identifier;

    //Build Identifier
    return (h << 8) + (m1 << 4) + m2;

}

h1 = evaluateSpecificHand([{color: 1, value: 12}, {color: 2, value: 12}, {color: 0, value: 11}, {color: 3, value: 11}, {color: 2, value: 4}]);
h2 = evaluateSpecificHand([{color: 0, value: 2}, {color: 0, value: 3}, {color: 0, value: 4}, {color: 0, value: 5}, {color: 0, value: 6}]);

cards1 = [{color: 1, value: 4}, {color: 1, value: 7}, {color: 0, value: 3}, {color: 1, value: 2}, {color: 1, value: 3}, {color: 2, value: 12}, {color: 1, value: 5}]
cards2 = [{color: 0, value: 11}, {color: 3, value: 10}, {color: 0, value: 3}, {color: 1, value: 2}, {color: 1, value: 3}, {color: 2, value: 12}, {color: 1, value: 5}]

console.log("h1 is: " + evaluateCards(cards1).toString(2) + "\nh2 is: " + evaluateCards(cards2).toString(2));
