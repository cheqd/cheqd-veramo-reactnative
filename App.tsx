import React, { useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, View, Text, Button } from 'react-native'
// Import agent from setup
import { agent } from './src/veramo/setup'
import { createCredentialLd, createDidPayload } from './src/cheqd/utils'
import { VerifiableCredential } from '@veramo/core'

interface Identifier {
  did: string
}

const App = () => {
  const [identifiers, setIdentifiers] = useState<Identifier[]>([])
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([])

  // Add the new identifier to state
  const createIdentifier = async () => {
    const didPayload = createDidPayload()
    console.log(didPayload)
    try {
    const _id = await agent.didManagerCreate({kms: 'local', options: { keys: didPayload.keys, document: didPayload.didPayload}})
    setIdentifiers((s) => s.concat([_id]))
    } catch(error: any) {
      throw new Error(error)
    }
  }

  const createCredential = async () => {
    const identifers = await agent.didManagerFind()
    console.log(identifers)
    if(identifers.length > 1) {
      const credential = await createCredentialLd(identifers[0].did, identifers[1].did)
      setCredentials((s: any)=> s.concat([credential]))
    }
  }

  // Check for existing identifers on load and set them to state
  useEffect(() => {
    const getIdentifiers = async () => {
      const _ids = await agent.didManagerFind()
      setIdentifiers(_ids)

      // Inspect the id object in your debug tool
      console.log('_ids:', _ids)
    }

    const getCredentials = async () => {
      const _creds = await agent.dataStoreGetVerifiableCredential()
      console.log('_creds', _creds)
    }

    getIdentifiers()
    getCredentials()
  }, [])

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Identifiers</Text>
          <View style={{ marginBottom: 50, marginTop: 20 }}>
            {identifiers && identifiers.length > 0 ? (
              identifiers.map((id: Identifier) => (
                <View key={id.did}>
                  <Text>{id.did}</Text>
                </View>
              ))
            ) : (
              <Text>No identifiers created yet</Text>
            )}
          </View>
          <Button onPress={() => createIdentifier()} title={'Create Identifier'} />
        </View>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 30, fontWeight: 'bold' }}>Credentials</Text>
          <View style={{ marginBottom: 50, marginTop: 20 }}>
            {credentials && credentials.length > 0 ? (
              credentials.map((cred: VerifiableCredential) => (
                <View key={cred.id}>
                  <Text>{JSON.stringify(cred)}</Text>
                </View>
              ))
            ) : (
              <Text>No credentials created yet, Atleast two identifiers needed</Text>
            )}
          </View>
          <Button onPress={() => createCredential()} title={'Create Credential'} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default App