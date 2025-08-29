import "dotenv/config"
import axios from "axios"
import { createBot, createProvider, createFlow, addKeyword, EVENTS } from '@builderbot/bot'
import { MemoryDB } from '@builderbot/bot'
import { BaileysProvider } from '@builderbot/provider-baileys'
import { httpInject } from "@builderbot-plugins/openai-assistants"
import { typing } from "./utils/presence"

const PORT = process.env.PORT ?? 3008
const userQueues = new Map();
const userLocks = new Map();

const processUserMessage = async (ctx, { flowDynamic, state, provider }) => {
    await typing(ctx, provider);

    try {
        let numero = ctx.from; // Ej: 51977292965@s.whatsapp.net o 274001783976102@lid

        // 🚨 Si viene con @lid intentamos resolver
        if (numero.endsWith("@lid")) {
            try {
                const result = await Promise.race([
                    provider.vendor.onWhatsApp(numero),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout onWhatsApp")), 2000)
                    )
                ]);

                if (result && result[0]?.jid) {
                    numero = result[0].jid; // Ej: 51943097937@s.whatsapp.net
                } else {
                    console.warn("⚠️ No se pudo resolver @lid, se usará tal cual:", numero);
                }
            } catch (err) {
                console.error("⚠️ Error resolviendo JID @lid:", err.message);
                // seguimos con el numero original (el @lid)
            }
        }

        // 🔎 Normalizamos quitando el sufijo (@s.whatsapp.net, @lid, etc.)
        const numeroLimpio = numero.replace(/@.*$/, "");

        // 🚀 Enviamos al backend siempre algo válido
        const response = await axios.post(
            process.env.URL_BACKEND,
            {
                mensaje: ctx.body,
                numero: numeroLimpio,
            },
            {
                headers: {
                    "X-API-KEY": process.env.BOT_API_KEY,
                },
            }
        );

        const respuesta = response.data.respuesta;
        await flowDynamic([{ body: respuesta }]);

    } catch (error) {
        console.error("❌ Error al conectarse al backend:", error.message);
        await flowDynamic([{ body: "Error al procesar tu mensaje. Intenta más tarde." }]);
    }
};



const handleQueue = async (userId) => {
    const queue = userQueues.get(userId);
    
    if (userLocks.get(userId)) return;

    while (queue.length > 0) {
        userLocks.set(userId, true);
        const { ctx, flowDynamic, state, provider } = queue.shift();
        try {
            await processUserMessage(ctx, { flowDynamic, state, provider });
        } catch (error) {
            console.error(`Error al procesar mensaje de ${userId}:`, error);
        } finally {
            userLocks.set(userId, false);
        }
    }

    userLocks.delete(userId);
    userQueues.delete(userId);
};

const welcomeFlow = addKeyword<BaileysProvider, MemoryDB>(EVENTS.WELCOME)
    .addAction(async (ctx, { flowDynamic, state, provider }) => {
        const userId = ctx.from;

        if (!userQueues.has(userId)) {
            userQueues.set(userId, []);
        }

        const queue = userQueues.get(userId);
        queue.push({ ctx, flowDynamic, state, provider });

        if (!userLocks.get(userId) && queue.length === 1) {
            await handleQueue(userId);
        }
    });

const main = async () => {
    const adapterFlow = createFlow([welcomeFlow]);

    const adapterProvider = createProvider(BaileysProvider, {
        groupsIgnore: true,
        readStatus: false,
    });

    const adapterDB = new MemoryDB();

    const { httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    httpInject(adapterProvider.server);
    httpServer(+PORT);
};

main()
    .then(() => console.log("🤖 Bot iniciado correctamente..."))
    .catch(err => console.error("❌ Error al iniciar el bot:", err));
process.stdin.resume();