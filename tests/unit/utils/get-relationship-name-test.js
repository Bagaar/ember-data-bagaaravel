import { RELATIONSHIP_ADAPTER_OPTION } from '@bagaaravel/ember-data-extensions/config';
import getRelationshipName from '@bagaaravel/ember-data-extensions/utils/get-relationship-name';
import { module, test } from 'qunit';

module('Unit | Utility | get-relationship-name', function () {
  test('it returns the relationship name', function (assert) {
    let snapshot = {
      adapterOptions: {
        [RELATIONSHIP_ADAPTER_OPTION]: 'projects',
      },
    };

    let relationshipName = getRelationshipName(snapshot.adapterOptions);

    assert.equal(relationshipName, 'projects');
  });
});
