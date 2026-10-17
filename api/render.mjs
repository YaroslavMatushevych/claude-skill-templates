import { handle, service } from "./_handler.mjs";

export default handle("POST", (body) => service.render(body));
