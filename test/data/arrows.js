const f1 = (o) => { return o.y }

const f2 = (o) => o.y;

const f3 = o => o.y;

const f4 = (o) => {
    o.y++;
    return o.y;
}


// $ echo "const x=(y)=>{return o.y}" | acorn -
// {
//   "type": "Program",
//   "start": 0,
//   "end": 26,
//   "body": [
//     {
//       "type": "VariableDeclaration",
//       "start": 0,
//       "end": 25,
//       "declarations": [
//         {
//           "type": "VariableDeclarator",
//           "start": 6,
//           "end": 25,
//           "id": {
//             "type": "Identifier",
//             "start": 6,
//             "end": 7,
//             "name": "x"
//           },
//           "init": {
//             "type": "ArrowFunctionExpression",
//             "start": 8,
//             "end": 25,
//             "id": null,
//             "generator": false,
//             "expression": false,
//             "params": [
//               {
//                 "type": "Identifier",
//                 "start": 9,
//                 "end": 10,
//                 "name": "y"
//               }
//             ],
//             "body": {
//               "type": "BlockStatement",
//               "start": 13,
//               "end": 25,
//               "body": [
//                 {
//                   "type": "ReturnStatement",
//                   "start": 14,
//                   "end": 24,
//                   "argument": {
//                     "type": "MemberExpression",
//                     "start": 21,
//                     "end": 24,
//                     "object": {
//                       "type": "Identifier",
//                       "start": 21,
//                       "end": 22,
//                       "name": "o"
//                     },
//                     "property": {
//                       "type": "Identifier",
//                       "start": 23,
//                       "end": 24,
//                       "name": "y"
//                     },
//                     "computed": false
//                   }
//                 }
//               ]
//             }
//           }
//         }
//       ],
//       "kind": "const"
//     }
//   ],
//   "sourceType": "script"
// }