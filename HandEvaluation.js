function evaluateCards(cards)
{
    let rank = 0;

    //Case 0: Rank for bank
     
}

function evaluateSpecificHand(hand)
{
    //Hand identifier explanation:
    // 1 Byte Number:
    // 4 MSB: Describe Hand State (0: High Card - 8: Straight Flush)
    // 4 LSB: Describe State Identifier via Highest Card (0: Card Value 2 - 12: Card Value Ace)
    // Hand Identifier ranges from 0b00000000 (Theoretically Highest Card Two) to 0b10011101 (Straight Flush with Ace -> Royal Flush)
    // If a given Hand h1 is better than another h2, h1 > h2 always yields true.
    let identifier = n(0, hand);
    
    //Hyper params for hand evaluation
    let sCol = c(0, hand);
    let lP1 = -1;
    let lP2 = -1;
    let over  = -1
    
    //Possible 9 hand states are one by one excluded by masking a 9 bit number.
    let validStates = 511;
    
    //Look at hand card by card
    for(let i = 1; i < 5; i++)
    {
        //Look at next card
        let open = n(i, hand)

        //Check range
        let r = open - identifier;
        if(r > 4 || r < 4)
            validStates &= 0b011101111;

        //Handle equivalence
        if(open == identifier || open == lP1 || open == lP2 || open == over)
            validStates &= 0b011001110;
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
    
    //Open second card
    let open = n(1, hand);

    //Possible exclusions 
    //Straights
    let range = open - hand;
    if(range < -4 || range > 4)
        validStates &= 0b011101111;
    
    //Flushes
    if(hand[0].Color == hand[1].Color)
        validStates &= 0b011011111;


    //Iterate non excluded states
    for(let state in validStates){

    }
}

const normalizeAce = number => --number < 0 ? 12 : number;
const n = (number, hand) => normalizeAce(hand[number].Number);
const c = (number, hand) => normalizeAce(hand[number].Color);

console.log(normalizeAce(0));