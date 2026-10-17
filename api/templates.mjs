import { handle, service } from "./_handler.mjs";

export default handle("GET", () => service.templates());
