import { Idl } from '@project-serum/anchor';

export const IDL: Idl = {
    "version": "0.1.0",
    "name": "payment_proxy",
    "instructions": [
      {
        "name": "initialize",
        "accounts": [
          {
            "name": "state",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "registerRequest",
        "accounts": [
          {
            "name": "creator",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "requestTracker",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "requestId",
            "type": "string"
          },
          {
            "name": "amountUsdc",
            "type": "u64"
          },
          {
            "name": "recipient",
            "type": "publicKey"
          }
        ]
      },
      {
        "name": "payRequest",
        "accounts": [
          {
            "name": "programState",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "requestTracker",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "payment",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "payerUsdc",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "recipientUsdc",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "feeCollectorUsdc",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "requestId",
            "type": "string"
          }
        ]
      },
      {
        "name": "makeSinglePayment",
        "accounts": [
          {
            "name": "programState",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "paymentRecord",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "payer",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "payerUsdc",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "recipientUsdc",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "feeCollectorUsdc",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "tokenProgram",
            "isMut": false,
            "isSigner": false
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "amountUsdc",
            "type": "u64"
          },
          {
            "name": "payerName",
            "type": "string"
          },
          {
            "name": "reason",
            "type": "string"
          }
        ]
      },
      {
        "name": "updateFees",
        "accounts": [
          {
            "name": "programState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          }
        ],
        "args": [
          {
            "name": "newFeeBasisPoints",
            "type": "u16"
          }
        ]
      },
      {
        "name": "updateFeeCollector",
        "accounts": [
          {
            "name": "programState",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "authority",
            "isMut": true,
            "isSigner": true
          }
        ],
        "args": [
          {
            "name": "newFeeCollector",
            "type": "publicKey"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "ProgramState",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "authority",
              "type": "publicKey"
            },
            {
              "name": "usdcMint",
              "type": "publicKey"
            },
            {
              "name": "feeCollector",
              "type": "publicKey"
            },
            {
              "name": "feeBasisPoints",
              "type": "u16"
            }
          ]
        }
      },
      {
        "name": "RequestTracker",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "creator",
              "type": "publicKey"
            },
            {
              "name": "requestId",
              "type": "string"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "recipient",
              "type": "publicKey"
            },
            {
              "name": "createdAt",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "Payment",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "requestId",
              "type": "string"
            },
            {
              "name": "tokenMint",
              "type": "publicKey"
            },
            {
              "name": "usdcAmount",
              "type": "u64"
            },
            {
              "name": "usdcFee",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "payer",
              "type": "publicKey"
            },
            {
              "name": "recipient",
              "type": "publicKey"
            }
          ]
        }
      },
      {
        "name": "SinglePaymentRecord",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "payer",
              "type": "publicKey"
            },
            {
              "name": "payerName",
              "type": "string"
            },
            {
              "name": "recipient",
              "type": "publicKey"
            },
            {
              "name": "usdcAmount",
              "type": "u64"
            },
            {
              "name": "tokenMint",
              "type": "publicKey"
            },
            {
              "name": "usdcFee",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "reason",
              "type": "string"
            }
          ]
        }
      }
    ],
    "events": [
      {
        "name": "RequestCreated",
        "fields": [
          {
            "name": "requestId",
            "type": "string",
            "index": false
          },
          {
            "name": "creator",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "recipient",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "amount",
            "type": "u64",
            "index": false
          },
          {
            "name": "timestamp",
            "type": "i64",
            "index": false
          }
        ]
      },
      {
        "name": "PaymentCompleted",
        "fields": [
          {
            "name": "requestId",
            "type": "string",
            "index": false
          },
          {
            "name": "payer",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "recipient",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "usdcAmount",
            "type": "u64",
            "index": false
          },
          {
            "name": "tokenMint",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "usdcFee",
            "type": "u64",
            "index": false
          },
          {
            "name": "timestamp",
            "type": "i64",
            "index": false
          }
        ]
      },
      {
        "name": "FeeUpdated",
        "fields": [
          {
            "name": "previousFee",
            "type": "u16",
            "index": false
          },
          {
            "name": "newFee",
            "type": "u16",
            "index": false
          },
          {
            "name": "timestamp",
            "type": "i64",
            "index": false
          }
        ]
      },
      {
        "name": "FeeCollectorUpdated",
        "fields": [
          {
            "name": "previousCollector",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "newCollector",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "timestamp",
            "type": "i64",
            "index": false
          }
        ]
      },
      {
        "name": "SinglePaymentCompleted",
        "fields": [
          {
            "name": "payer",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "payerName",
            "type": "string",
            "index": false
          },
          {
            "name": "recipient",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "usdcAmount",
            "type": "u64",
            "index": false
          },
          {
            "name": "tokenMint",
            "type": "publicKey",
            "index": false
          },
          {
            "name": "usdcFee",
            "type": "u64",
            "index": false
          },
          {
            "name": "timestamp",
            "type": "i64",
            "index": false
          },
          {
            "name": "reason",
            "type": "string",
            "index": false
          }
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "InvalidRequest",
        "msg": "Invalid request ID"
      },
      {
        "code": 6001,
        "name": "UnauthorizedAccess",
        "msg": "Unauthorized access"
      },
      {
        "code": 6002,
        "name": "InvalidFeeAmount",
        "msg": "Invalid fee amount"
      },
      {
        "code": 6003,
        "name": "StringTooLong",
        "msg": "String too long"
      },
      {
        "code": 6004,
        "name": "InvalidMint",
        "msg": "Invalid mint - only USDC payments are accepted"
      }
    ]
  }