export const createInterface = () => {
  if (process.env.readline === 'no_manifest') {
    return `
mock message in console
`;
  }

  if (process.env.readline === 'manifest') {
    return (async function* (): any {
      yield `
# start
name: mock-name
description: mock-description
# end
        `;
    })();
  }

  return [];
};
