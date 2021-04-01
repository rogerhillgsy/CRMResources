# PCF Control Configuration in CRM forms editor

This folder contains the code for a Chrome extension that addresses a particular problem with PCF controls on CRM forms.

When configuring a SimpleText.* or Multiple type aprameter field, the length of the text is limited to 100 characters.
This has been noted in a number of places since 2019, and MS seem to accept it as a bug. 
The workaround is to use the chrome debugger  to directly change the line: -

``` HTML
<textarea id="txtAreaStaticValue" name="txtAreaValue" class="customcontrolproperty-setselectwidth" maxlength="100" style="display: inline-block;" title="Value to assign"></textarea>
```

to

``` HTML
<textarea id="txtAreaStaticValue" name="txtAreaValue" class="customcontrolproperty-setselectwidth" style="display: inline-block;resize: both;" title="Value to assign"></textarea>
```

This allows an unlimited amount of text to be supplied in the configuration.

