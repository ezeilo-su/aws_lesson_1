import * as cdk from "aws-cdk-lib";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";
import { join } from "path";
import * as s3 from "aws-cdk-lib/aws-s3";
import { CustomLambda } from "./component/customLambda";
import { Cors, LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";

export class Lesson1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const usersFnName = "usersFn";
    const resizeImageFnName = "resizeImage";

    const userFn = new CustomLambda(this, usersFnName, {
      entry: join(__dirname, "../src/handler/users.ts"),
      functionName: usersFnName,
    });

    const resizeImages = new CustomLambda(this, resizeImageFnName, {
      entry: join(__dirname, "../src/handler/resize-images.ts"),
      functionName: resizeImageFnName,
    });

    const imageUploadBucket = new s3.Bucket(this, "zeilotechImages", {
      bucketName: "zeilotech-images",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.HEAD,
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
          ],
          maxAge: 3600,
          exposedHeaders: ["Date", "Etag"],
        },
      ],
    });

    const imageBucketDest = new s3.Bucket(this, "zeilotechImagesDest", {
      bucketName: "zeilotech-images-dest",
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enforceSSL: true,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.HEAD,
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
          ],
          maxAge: 3600,
          exposedHeaders: ["Date", "Etag"],
        },
      ],
    });

    const s3PutEventSource = new lambdaEventSources.S3EventSource(
      imageUploadBucket,
      {
        events: [s3.EventType.OBJECT_CREATED_PUT],
      }
    );

    resizeImages.instance.addEventSource(s3PutEventSource);
    imageUploadBucket.grantRead(resizeImages.instance);
    imageBucketDest.grantWrite(resizeImages.instance);

    const api = new RestApi(this, "restAPI", {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    });

    const users = api.root.addResource("users");

    users.addMethod("POST", new LambdaIntegration(userFn.instance));
  }
}

// AWS SQS, SNS
