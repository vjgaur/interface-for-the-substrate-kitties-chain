import React, { useEffect, useState } from 'react';
import { Form, Grid } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';

import KittyCards from './KittyCards';

/*

The way our custom components make use of Polkadot-JS API is by using `substrate-lib`, which is a
wrapper around [Polkadot JS API instance](https://polkadot.js.org/docs/api/start/create/) and
allows us to retrieve account keys from the [Polkadot-JS keyring](https://polkadot.js.org/docs/api/start/keyring).
This is why we use `useSubstrate` which is exported by `src/substrate-lib/SubstrateContext.js` and
used to create the wrapper.
```
*/

// Construct a Kitty ID from storage key
const convertToKittyHash = entry =>
  `0x${entry[0].toJSON().slice(-64)}`;

// Construct a Kitty object
const constructKitty = (hash, { dna, price, gender, owner }) => ({
  id: hash,
  dna,
  price: price.toJSON(),
  gender: gender.toJSON(),
  owner: owner.toJSON()
});

// Use React hooks
export default function Kitties(props) {
    const { api, keyring } = useSubstrate();
    const { accountPair } = props;

    const [kittyHashes, setKittyHashes] = useState([]);
    const [kitties, setKitties] = useState([]);
    const [status, setStatus] = useState('');
}
// snip

// Subscription function for setting Kitty IDs
const subscribeKittyCnt = () => {
    let unsub = null
  
    const asyncFetch = async () => {
      // Query KittyCnt from runtime
      unsub = await api.query.substrateKitties.kittyCnt(async cnt => {
        // Fetch all Kitty objects using entries()
        const entries = await api.query.substrateKitties.kitties.entries()
        // Retrieve only the Kitty ID and set to state
        const hashes = entries.map(convertToKittyHash)
        setKittyHashes(hashes)
      })
    }
  
    asyncFetch()
  
    // return the unsubscription cleanup function
    return () => {
      unsub && unsub()
    }
}
  
//Subscription function to construct a Kitty object
const subscribeKitties = () => {
    let unsub = null

    const asyncFetch = async () => {
        
        //Get Kitty objects from storage 
        unsub = await api.query.substrateKitties.multi(kittyHashes, kitties => {
            
            //Create an array of kitty objects from 'constructKitty'
            const kittyArr = kitties.map((kitty, ind) =>
                constructKitty(kittyHashes[ind],kitty.value)
            )
            setKitties(kittyArr)
        })
        asyncFetch()

        return () => {
            unsub && unsub()
        }
    }
}
const asyncFetch = async () => {
    unsub = await api.query.substrateKitties.kitties.kittyCnt(async cnt => {
      // Fetch all kitty keys
      const entries =
        await api.query.substrateKitties.kitties.kitties.entries()
      const hashes = entries.map(convertToKittyHash)
      setKittyHashes(hashes)
    })

// return the unsubscription cleanup function
return () => {
  unsub && unsub();
};
};

useEffect(subscribeKittyCnt, [api, keyring]);
useEffect(subscribeKitties, [api, kittyHashes]);

return <Grid.Column width={16}>
<h1>Kitties</h1>
<KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
<Form style={{ margin: '1em 0' }}>
    <Form.Field style={{ textAlign: 'center' }}>
      <TxButton
        accountPair={accountPair} label='Create Kitty' type='SIGNED-TX' setStatus={setStatus}
        attrs={{
          palletRpc: 'substrateKitties',
          callable: 'createKitty',
          inputParams: [],
          paramFields: []
        }}
      />
    </Form.Field>
  </Form>
  <div style={{ overflowWrap: 'break-word' }}>{status}</div>
</Grid.Column>


