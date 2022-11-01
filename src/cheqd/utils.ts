import { createDidPayloadWithSignInputs } from "@cheqd/sdk"
import { CredentialPayload, VerifiableCredential } from "@veramo/core"
import { toString, fromString } from 'uint8arrays'
import { agent } from "../veramo/setup"

export function createDidPayload() {
    const payload = createDidPayloadWithSignInputs(randomStr())
    payload.didPayload.assertionMethod = payload.didPayload.authentication
    payload.keys = [convertKeyPairtoTImportableEd25519Key(payload.keys[0])]
    return payload
}

export function randomStr() {
    var arr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var ans = '';
    for (var i = 32; i > 0; i--) {
        ans += 
          arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}

export function convertKeyPairtoTImportableEd25519Key(keyPair: any) : any {
    return {
        type: 'Ed25519',
        privateKeyHex: toString(fromString(keyPair.privateKey!, 'base64'), 'hex'),
        kid: randomStr(),
        publicKeyHex: toString(fromString(keyPair.publicKey, 'base64'), 'hex')
    }
}

export async function createCredentialLd(did: string, issuerDID: string) {
    const credentialSubject =  {
        id: did,
        type: {
            name: did
        }
    }
    const credential: CredentialPayload = {
        issuer: { id: issuerDID },
        '@context': ['https://www.w3.org/2018/credentials/v1', 'https://veramo.io/contexts/profile/v1'],
        type: ['VerifiableCredential','Profile'],
        issuanceDate: new Date().toISOString(),
        credentialSubject,
    }

    const verifiableCredential: VerifiableCredential = await agent.createVerifiableCredential({
        save: true,
        credential,
        proofFormat: 'lds'
    })
    return verifiableCredential
}