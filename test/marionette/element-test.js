//this is hack to ensure device interactions are
//loaded

suite('marionette/element', function() {
  var driver, subject, client, id, device,
       Element, Client;

  helper.require('element', function(obj) {
    Element = obj;
  });

  helper.require('client', function(obj) {
    Client = obj;
  });

  id = '{fake-uuid-root}';

  function simpleCommand(method, type, responseKey) {
    suite('.' + method, function() {
      device.
        issues(method).
        shouldSend({
          type: type,
          element: id
        }).
        serverResponds(responseKey).
        callbackReceives(responseKey);
    });
  }

  device = new DeviceInteraction(exampleCmds, function() {
    return subject;
  });

  setup(function() {
    driver = new MockDriver();
    client = new Client(driver);
    subject = new Element(id, client);
  });

  suite('initialization', function() {
    test('should set id', function() {
      assert.strictEqual(subject.id, id);
    });

    test('should set client', function() {
      assert.strictEqual(subject.client, client);
    });
  });

  suite('._sendCommand', function() {
    device.
      issues('_sendCommand', { type: 'test' }, 'ok').
      shouldSend({ type: 'test', element: id }).
      serverResponds('ok').
      callbackReceives('ok');
  });

  suite('.findElement', function() {
    device.
      issues('findElement', '#id').
      shouldSend({
        value: '#id',
        type: 'findElement',
        element: id
      }).
      serverResponds('findElementResponse');

    test('should send callback a single element', function() {
      var value = device.commandCallback.value,
          resultId = exampleCmds.findElementResponse().value;
      assert.instanceOf(value, Element);
      assert.strictEqual(value.id, resultId);
    });
  });

  suite('.findElements', function() {
    device.
      issues('findElements', '#id').
      shouldSend({
        value: '#id',
        type: 'findElements',
        element: id
      }).
      serverResponds('findElementsResponse');

    test('should send callback an element instance', function() {
      var map = device.commandCallback.value.map(function(el) {
        return el.id;
      });
      assert.deepEqual(map, exampleCmds.findElementsResponse().value);
    });
  });

  suite('.scriptWith', function() {
    var calledWith,
        fn = function() {},
        cb = function() {};

    setup(function() {
      subject.client.executeScript = function() {
        calledWith = arguments;
      }

      subject.scriptWith(fn, cb);
    });

    test('should call client.executeScript with element as argument', function() {
      assert.strictEqual(calledWith[0], fn);
      assert.deepEqual(calledWith[1], [
        subject
      ]);

      assert.strictEqual(calledWith[2], cb);
    });

  });

  suite('.equals', function() {
    var otherId = 'foo';

    suite('when given an id', function() {
      device.
        issues('equals', otherId).
        shouldSend({
          type: 'elementsEqual',
          elements: [id, otherId]
        }).
        serverResponds('value').
        callbackReceives('value');
    });

    suite('when given an element instance', function() {
      setup(function() {
        var element = new Element(otherId, device);
        subject.equals(element, device.commandCallback);
      });

      device.
        shouldSend({
          type: 'elementsEqual',
          elements: [id, otherId]
        }).
        serverResponds('elementEqualsResponse').
        callbackReceives('value');

    });

  });

  suite('.getAttribute', function() {
    var attr = 'name';

    device.
      issues('getAttribute', attr).
      shouldSend({
        type: 'getElementAttribute',
        name: attr,
        element: id
      }).
      serverResponds('value').
      callbackReceives('value');
  });

  suite('.sendKeys', function() {
    var msg = 'foo';

    device.
      issues('sendKeys', msg).
      shouldSend({
        type: 'sendKeysToElement',
        value: msg,
        element: id
      }).
      serverResponds('ok').
      callbackReceives('ok');
  });

  suite('.tap', function() {
    var x = 10;
    var y = 15;

    device.
      issues('tap', x, y).
      shouldSend({
        type: 'singleTap',
        x: x,
        y: y,
        element: id
      }).
      serverResponds('value').
      callbackReceives('value');
  });

  simpleCommand('tagName', 'getElementTagName', 'value');
  simpleCommand('click', 'clickElement', 'ok');
  simpleCommand('text', 'getElementText', 'value');
  simpleCommand('clear', 'clearElement', 'ok');
  simpleCommand('selected', 'isElementSelected', 'value');
  simpleCommand('enabled', 'isElementEnabled', 'value');
  simpleCommand('displayed', 'isElementDisplayed', 'value');
  simpleCommand('size', 'getElementSize', 'value');

});
