
// Define the structure of the opportunity wizrd

Arup = typeof (Arup) === 'undefined' ? {} : Arup;

Arup.OpportunityWizard = function( config ) {
    config = config || {};

    config.containerSelector = config.containerSelector || ".wizard-content";
    config.stepSelector = config.stepSelector || ".wizard-step";
    config.steps = $(config.containerSelector + " " + config.stepSelector);
    var stepCount = config.steps.length;
    var exitText = config.exit || 'Exit';
    var backText = config.back || 'Back';
    var nextText = config.next || 'Next';
    var finishText = config.finish || 'Finish';
    var confirmText = config._confirm || 'Confirm';
    var cancelText = config._cancel || 'Cancel';
    var isModal = config.isModal || true;


    var step1Config = {
        name: "Opportunity <br/>Category",
        parent : config ,
        constraints : {

        },
        validateNext : function(form) {
            validate(form, this.constraints);
            var selected = [];
            $('#UR input:checked').each(function () {
                selected.push($(this).attr('value'));
            });
            if (selected.length < 1) {
                Alert.show('<font size="6" color="#FF9B1E"><b>Warning</b></font>',
                    '<font size="3" color="#000000"></br>Please select atleast one role to proceed or you can exit if you choose to.</font>',
                    [
                        {
                            label: "<b>OK</b>",
                            callback: function () {

                            },
                            setFocus: true,
                            preventClose: false
                        }
                    ],
                    'Warning',
                    600,
                    250,
                    '',
                    true);
                return false;
            }
            else {
                $('input:checkbox').removeAttr('checked');
                return true;
            }

        }
    }
    var validateFinish = config.validateFinish || function() { return true };

    $(config.steps[0]).show();
    var page1 = new Arup.OpportunityWizardStep(step1Config);

};

Arup.OpportunityWizardStep = function(newConfig) {
    var config = newConfig;

    var step = 1;
    var container = $(this).find(config.parent.containerSelector);
    config.parent.steps.hide();

    if (isModal) {
        $().on('hidden.bs.modal', function () {
            step = 1;
            $($(config.parent.containerSelector + " .wizard-steps-panel .step-number")
                    .removeClass("done")
                    .removeClass("doing")[0])
                .toggleClass("doing");

            $($(parent.config.containerSelector + " .wizard-step")
                    .hide()[0])
                .show();

            btnBack.hide();
            btnExit.show();
            btnFinish.hide();
            btnNext.show();
            btnConfirm.hide();

        });
    };
    $(".wizard-steps-panel").remove();
    container.prepend('<div class="wizard-steps-panel steps-quantity-' + stepCount + '"></div>');
    var stepsPanel = $(this).find(".wizard-steps-panel");

}

Arup.function =  function(config) {
    var validateNext = function()
    {
        alert("Validate Next");
    }
}