import { APIGatewayProxyEvent } from 'aws-lambda';

export async function handler(event: APIGatewayProxyEvent) {
  console.log({ event });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: ['users']
    })
  };
}
