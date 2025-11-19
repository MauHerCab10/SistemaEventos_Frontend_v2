//Interfaz q nos permite recibir la respuesta estándar de todas nuestras solicitudes HTTP
export interface ResponseApi
{
    isSuccess: boolean,
    mensaje: string,
    valor: any
}