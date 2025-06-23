import { generateOkxPayload } from './okx';
import { generateBybitPayload } from './bybit';


const payloadHandlers = {
  okx: generateOkxPayload,
  bybit: generateBybitPayload
};

export const generatePayload = (urlParams) => {
  const state = urlParams.get("state");
  if (!state) throw new Error("Missing state");

  let parsedState;
  try {
    parsedState = JSON.parse(state);
  } catch {
    throw new Error("Invalid JSON in state param");
  }

  const provider = parsedState.provider?.toLowerCase();
  if (!provider || !(provider in payloadHandlers)) {
    throw new Error(`Unsupported or missing provider: ${provider}`);
  }

  return payloadHandlers[provider](urlParams);
}