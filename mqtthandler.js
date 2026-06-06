import mqtt from 'mqtt';
import { autenticarNFC } from './services/nfcAuth.js';

export default function iniciarMQTT(io){

    const client = mqtt.connect(
        'mqtt://broker.hivemq.com:1883'
    );

    client.on('connect',()=>{

        console.log('Conectado ao broker MQTT');

        client.subscribe(
            'gof/nfc/request'
        );

    });

    client.on(
        'message',
        async(topic,message)=>{

            try{

                const payload=JSON.parse(
                    message.toString()
                );

                console.log(
                    'UID recebido:',
                    payload.uid
                );

                const auth=
                await autenticarNFC(
                    payload.uid
                );

                if(!auth){

                    client.publish(
                        'gof/nfc/response',
                        'NEGADO'
                    );

                    return;
                }

                client.publish(
                    'gof/nfc/response',
                    'PERMITIDO'
                );

                io.emit(
                    'nfcAuth',
                    {
                        uid: auth.uid,
                        operador: auth.operador
                    }
                );

            }catch(error){

                console.error(
                    'Erro MQTT:',
                    error
                );

                client.publish(
                    'gof/nfc/response',
                    'ERRO'
                );

            }

        }
    );

    return client;
}